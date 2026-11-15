import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  ArrowUp,
  ImagePlus,
  Volume2,
  VolumeX,
  Plus,
  Brain,
  X,
  Copy,
  Check,
  LogIn,
  LogOut,
  Loader2,
  Trash2,
  ShieldCheck,
  Headphones,
  Radio,
  Layers,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { MemoryRecord, AgentIQAsset, Claim } from '../types';
import { NIMBUS_PRIME_CANONICAL_PROMPT } from '../canonical/nimbusPrimePrompt';
import { FileCatalogReport } from '../canonical/fileCheckCatalog';
import { useWebSpeech } from '../hooks/useWebSpeech';

export interface ChatAttachment {
  id: string;
  mimeType: string;
  base64: string;
  dataUrl: string;
  name: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  attachments?: Array<{ dataUrl: string; name: string }>;
  timestamp: string;
  viaVoice?: boolean;
}

interface ConversationalAgentProps {
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  memories: MemoryRecord[];
  iqAssets: AgentIQAsset[];
  claims: Claim[];
  messages: ConversationMessage[];
  onUpdateMessages: (next: ConversationMessage[]) => void;
  onAddMemory: (mem: MemoryRecord) => void;
  onDeleteMemory?: (memId: string) => void;
  onAddIQAsset: (asset: AgentIQAsset) => void;
  onSwitchToStudio?: () => void;
}

const CONVERSATIONAL_SYSTEM_PROMPT = NIMBUS_PRIME_CANONICAL_PROMPT;

const STARTER_PROMPTS = [
  'Build a canonical system prompt, MCP schema & TypeScript wrapper for a new agent',
  'Audit our File-Check Catalog and tightened Firebase Zero-Trust rules',
  'Architect a multi-agent workflow connecting MedGemma, SATCALC, and Cloud Run',
  'Review your Day-1 Visual IQ, 80/20 routing, and 75% context caching posture',
];

export default function ConversationalAgent({
  currentUser,
  onSignIn,
  onSignOut,
  memories,
  iqAssets,
  claims,
  messages,
  onUpdateMessages,
  onAddMemory,
  onDeleteMemory,
  onAddIQAsset,
  onSwitchToStudio,
}: ConversationalAgentProps) {
  const [input, setInput] = useState('');
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Live Gemini WebSocket Voice & Fallback Audio states
  const [isLiveVoiceActive, setIsLiveVoiceActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('');
  const [fallbackSpeakingId, setFallbackSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleSendRef = useRef<(presetPrompt?: string, fromVoice?: boolean) => Promise<void>>(
    async () => {}
  );

  // Native Browser Web Speech API (Hands-Free SpeechRecognition + SpeechSynthesis)
  const webSpeech = useWebSpeech({
    defaultAutoSpeak: false,
    onFinalTranscript: (transcript, isHandsFreeMode) => {
      if (isHandsFreeMode) {
        handleSendRef.current(transcript, true);
      } else {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setTimeout(() => adjustTextareaHeight(), 10);
      }
    },
  });

  // Subtle slide-over drawer (completely hidden unless clicked)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'memory' | 'iq' | 'catalog' | 'optimization'>('memory');
  const [newMemoryNote, setNewMemoryNote] = useState('');
  const [routingMode, setRoutingMode] = useState<'auto_80_20' | 'flash_lite' | 'flash_deep'>('auto_80_20');
  const [costReductionPct, setCostReductionPct] = useState<number>(75);
  const [catalogReport, setCatalogReport] = useState<FileCatalogReport | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [copiedCanonical, setCopiedCanonical] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Live WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const messagesRef = useRef<ConversationMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, isLiveVoiceActive]);

  useEffect(() => {
    return () => {
      stopLiveTalk();
      webSpeech.stopListening();
      webSpeech.stopSpeaking();
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
    };
  }, []);

  // Load current optimization & file-check catalog quietly when drawer opens
  useEffect(() => {
    if (!drawerOpen) return;
    fetch('/api/llm/optimization')
      .then((r) => r.json())
      .then((data) => {
        if (data?.metrics?.routingMode) setRoutingMode(data.metrics.routingMode);
        if (data?.metrics?.costReductionPct) setCostReductionPct(data.metrics.costReductionPct);
      })
      .catch(() => {});
  }, [drawerOpen]);

  const refreshFileCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (res.ok && data?.entries) {
        setCatalogReport(data);
      }
    } catch {
      // ignore offline
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    if (drawerOpen && drawerTab === 'catalog' && !catalogReport) {
      refreshFileCatalog();
    }
  }, [drawerOpen, drawerTab]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  // Handle staging image files (via button or drag & drop)
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        const base64 = dataUrl.split(',')[1] || '';
        setStagedAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            mimeType: file.type || 'image/jpeg',
            base64,
            dataUrl,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Speak any assistant response via Web Speech API SpeechSynthesis (with server Gemini TTS fallback)
  const handleSpeakMessage = async (msgId: string, text: string) => {
    // Prefer native browser SpeechSynthesis for zero-latency hands-free readback
    if (webSpeech.isSynthesisSupported) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
        setFallbackSpeakingId(null);
      }
      webSpeech.speak(text, msgId);
      return;
    }

    if (fallbackSpeakingId === msgId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      setFallbackSpeakingId(null);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    setFallbackSpeakingId(msgId);
    try {
      const cleanSpeech = text.replace(/[#*`_~]/g, '').slice(0, 880);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanSpeech, voiceName: 'Zephyr' }),
      });
      const data = await res.json();
      if (res.ok && data.audioDataUrl) {
        const audio = new Audio(data.audioDataUrl);
        activeAudioRef.current = audio;
        audio.onended = () => setFallbackSpeakingId(null);
        audio.onerror = () => setFallbackSpeakingId(null);
        await audio.play();
      } else {
        setFallbackSpeakingId(null);
      }
    } catch {
      setFallbackSpeakingId(null);
    }
  };

  // Play 24kHz PCM chunks from Gemini 3.8 Live API
  const playLivePcm24k = (base64Pcm: string) => {
    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = outputAudioCtxRef.current;
    const binary = atob(base64Pcm);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, nextPlayTimeRef.current);
    src.start(startAt);
    nextPlayTimeRef.current = startAt + buffer.duration;
  };

  // Append or merge live voice transcriptions cleanly into the unified conversation thread
  const appendVoiceTranscript = (role: 'user' | 'assistant', chunkText: string) => {
    const trimmed = chunkText.trim();
    if (!trimmed) return;

    const current = [...messagesRef.current];
    const last = current[current.length - 1];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (last && last.viaVoice && last.role === role) {
      current[current.length - 1] = {
        ...last,
        text: `${last.text} ${trimmed}`.replace(/\s+/g, ' ').trim(),
      };
    } else {
      current.push({
        id: `voice-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        role,
        text: trimmed,
        timestamp: nowTime,
        viaVoice: true,
      });
    }
    onUpdateMessages(current);
  };

  const startLiveTalk = async () => {
    try {
      setLiveStatus('Connecting...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/live`);
      wsRef.current = ws;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextPlayTimeRef.current = 0;

      ws.onopen = () => {
        setIsLiveVoiceActive(true);
        setLiveStatus('Listening');

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          const bytes = new Uint8Array(pcm16.buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          ws.send(JSON.stringify({ audio: btoa(binary) }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            setLiveStatus('Speaking');
            playLivePcm24k(msg.audio);
          }
          if (msg.userTranscription) {
            appendVoiceTranscript('user', msg.userTranscription);
          }
          if (msg.modelTranscription) {
            appendVoiceTranscript('assistant', msg.modelTranscription);
          }
          if (msg.interrupted) {
            nextPlayTimeRef.current = 0;
            setLiveStatus('Listening');
          }
        } catch {}
      };

      ws.onclose = () => {
        setIsLiveVoiceActive(false);
        setLiveStatus('');
      };
    } catch {
      setIsLiveVoiceActive(false);
      setLiveStatus('');
    }
  };

  const stopLiveTalk = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsLiveVoiceActive(false);
    setLiveStatus('');
  };

  const toggleLiveTalk = () => {
    if (isLiveVoiceActive) {
      stopLiveTalk();
    } else {
      startLiveTalk();
    }
  };

  // Send conversational message (Text + Hands-Free Voice + optional Multimodal Images)
  const handleSend = async (presetPrompt?: string, fromVoice?: boolean) => {
    const textToSend = (presetPrompt ?? input).trim();
    const attachmentsToSend = presetPrompt ? [] : [...stagedAttachments];

    if ((!textToSend && attachmentsToSend.length === 0) || isSending) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ConversationMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend || 'Added visual intelligence to Agent IQ.',
      attachments:
        attachmentsToSend.length > 0
          ? attachmentsToSend.map((a) => ({ dataUrl: a.dataUrl, name: a.name }))
          : undefined,
      timestamp: nowTime,
      viaVoice: fromVoice,
    };

    const currentThread = fromVoice ? messagesRef.current : messages;
    const updatedHistory = [...currentThread, userMessage];
    onUpdateMessages(updatedHistory);

    if (!presetPrompt) {
      setInput('');
      setStagedAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
    setIsSending(true);

    // If user explicitly says "remember ..." save to Day-1 memory immediately
    const lowerText = textToSend.toLowerCase();
    if (
      lowerText.startsWith('remember ') ||
      lowerText.includes('save to memory') ||
      lowerText.includes('add to memory')
    ) {
      onAddMemory({
        id: `mem-${Date.now().toString().slice(-5)}`,
        key: `operator_note_${Date.now().toString().slice(-4)}`,
        category: 'episodic',
        content: textToSend,
        relevanceScore: 0.99,
        lastAccessed: 'Just now',
        tags: ['Conversation', 'Day-1 History'],
        dayOneLineage: true,
      });
    }

    // Background structured IQ ingestion when an image is uploaded so the IQ drawer stays rich
    if (attachmentsToSend.length > 0) {
      const firstImg = attachmentsToSend[0];
      fetch('/api/agent/ingest-iq-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: firstImg.base64,
          mimeType: firstImg.mimeType,
          customTitle: firstImg.name.replace(/\.[^/.]+$/, ''),
          operatorNotes: textToSend,
        }),
      })
        .then((r) => r.json())
        .then((ingested) => {
          if (ingested?.extracted) {
            const ext = ingested.extracted;
            const assetId = `iq-${Date.now().toString().slice(-5)}`;
            onAddIQAsset({
              id: assetId,
              title: ext.title || firstImg.name,
              sourceLabel: 'Learned in Conversation',
              category: 'uploaded_visual',
              summary: ext.summary,
              extractedNodes: ext.extractedNodes || [],
              formulasOrRules: ext.formulasOrRules || [],
              ingestedAt: 'Just now',
              dayOneOrigin: true,
              imageDataUrl: firstImg.dataUrl,
              tags: ext.tags || ['Visual-IQ'],
            });
            onAddMemory({
              id: `mem-img-${Date.now().toString().slice(-4)}`,
              key: ext.memoryKey || `visual_iq_${Date.now().toString().slice(-4)}`,
              category: 'blueprint',
              content: ext.memoryDigest || ext.summary,
              relevanceScore: 0.99,
              lastAccessed: 'Just now',
              tags: ['Image-IQ', ...(ext.tags || []).slice(0, 2)],
              dayOneLineage: true,
              sourceAssetId: assetId,
            });
          }
        })
        .catch(() => {});
    }

    try {
      const memoryContext = memories
        .slice(0, 10)
        .map((m) => `- [${m.key}]: ${m.content}`)
        .join('\n');

      const claimsSummary = claims
        .map(
          (c) =>
            `${c.homeowner} (${c.location}, ${c.carrier}): Initial $${c.initialEstimate.toLocaleString()} -> Revised $${c.revisedEstimate.toLocaleString()} (+$${c.delta.toLocaleString()}), ${c.pitch} pitch, ${c.footprint} sqft, ${c.facets} facets`
        )
        .join(' | ');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          attachments: attachmentsToSend.map((a) => ({
            mimeType: a.mimeType,
            data: a.base64,
          })),
          history: messages.slice(-14).map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.text,
          })),
          useTierRouter: true,
          memoryDigestContext: `${memoryContext}\n\n[ACTIVE CLAIMS LEDGER]: ${claimsSummary}`,
          systemInstruction: CONVERSATIONAL_SYSTEM_PROMPT,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to reach Gemini.');
      }

      const assistantId = `a-${Date.now()}`;
      const replyText = data.outputText || 'Done.';
      const assistantMessage: ConversationMessage = {
        id: assistantId,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onUpdateMessages([...updatedHistory, assistantMessage]);

      if ((webSpeech.autoSpeak || webSpeech.handsFree || fromVoice) && replyText) {
        handleSpeakMessage(assistantId, replyText);
      }
    } catch (err: any) {
      onUpdateMessages([
        ...updatedHistory,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `Connection issue: ${err.message || 'Please try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const handleSaveManualMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryNote.trim()) return;
    onAddMemory({
      id: `mem-${Date.now().toString().slice(-5)}`,
      key: `day1_note_${Date.now().toString().slice(-4)}`,
      category: 'semantic',
      content: newMemoryNote.trim(),
      relevanceScore: 0.98,
      lastAccessed: 'Just now',
      tags: ['Day-1 History'],
      dayOneLineage: true,
    });
    setNewMemoryNote('');
  };

  const handleSwitchRouting = async (mode: 'auto_80_20' | 'flash_lite' | 'flash_deep') => {
    setRoutingMode(mode);
    try {
      const res = await fetch('/api/llm/optimization/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routingMode: mode }),
      });
      const data = await res.json();
      if (data?.metrics?.costReductionPct) {
        setCostReductionPct(data.metrics.costReductionPct);
      }
    } catch {}
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const isEmptyThread = messages.length === 0;

  return (
    <div
      className="h-dvh w-full bg-[#09090b] text-zinc-100 flex flex-col relative overflow-hidden selection:bg-cyan-500/20 selection:text-cyan-200"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
      }}
    >
      {/* Subtle Ambient Atmosphere */}
      <div className="pointer-events-none fixed top-[-18%] left-1/2 -translate-x-1/2 w-[680px] h-[420px] bg-cyan-500/[0.06] rounded-full blur-[130px]" />

      {/* Drag-and-Drop Overlay for Adding Visuals to Agent IQ */}
      {isDragging && (
        <div className="fixed inset-4 z-50 rounded-3xl border-2 border-dashed border-cyan-400/60 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 pointer-events-none">
          <ImagePlus className="w-10 h-10 text-cyan-400" />
          <p className="text-base font-medium text-white">Drop image to teach Nimbus iQ</p>
          <p className="text-xs text-zinc-400">
            Diagrams, notes, estimates, and storm photos are automatically indexed into Day-1 Memory
          </p>
        </div>
      )}

      {/* Minimal Top Bar */}
      <header className="h-14 shrink-0 px-4 sm:px-6 flex items-center justify-between z-20 border-b border-zinc-900/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateMessages([])}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
            title="New Conversation"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-sm font-semibold tracking-tight text-zinc-100">Nimbus iQ</span>
          </button>

          {!isEmptyThread && (
            <button
              onClick={() => onUpdateMessages([])}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Clear thread (Memories stay saved)"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {onSwitchToStudio && (
            <button
              onClick={onSwitchToStudio}
              className="ml-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Switch to Sovereign Multi-Vertical Studio"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sovereign Studio</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Hands-Free Web Speech Toggle */}
          {webSpeech.isRecognitionSupported && (
            <button
              onClick={() => {
                if (isLiveVoiceActive) stopLiveTalk();
                webSpeech.toggleHandsFree();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                webSpeech.handsFree
                  ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/40'
                  : 'text-zinc-400 hover:text-zinc-100 bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900'
              }`}
              title="Hands-Free Web Speech Mode: Continuous voice input & automatic spoken responses"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {webSpeech.handsFree
                  ? webSpeech.isSpeaking
                    ? 'Speaking'
                    : 'Hands-Free On'
                  : 'Hands-Free'}
              </span>
            </button>
          )}

          {/* Auto-Speak SpeechSynthesis Toggle */}
          <button
            onClick={() => {
              if (webSpeech.isSpeaking) webSpeech.stopSpeaking();
              webSpeech.setAutoSpeak(!webSpeech.autoSpeak);
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              webSpeech.autoSpeak
                ? 'text-cyan-400 bg-cyan-500/10'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            title={
              webSpeech.autoSpeak
                ? 'Speech Synthesis Auto-Speak: ON'
                : 'Speech Synthesis Auto-Speak: OFF'
            }
          >
            {webSpeech.autoSpeak ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Subtle Memory & IQ Drawer Trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Memory, Visual IQ, Voice & Sync"
          >
            <Brain className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Conversational Stream */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto min-h-full flex flex-col">
          {isEmptyThread && !isLiveVoiceActive ? (
            /* Calm Centered Empty State */
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="flex items-center gap-3 mb-7">
                <button
                  onClick={() => {
                    if (isLiveVoiceActive) stopLiveTalk();
                    webSpeech.toggleHandsFree();
                  }}
                  className={`group relative w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    webSpeech.handsFree
                      ? 'bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_45px_rgba(34,211,238,0.22)]'
                      : 'bg-zinc-900 border-zinc-800 hover:border-cyan-500/50 shadow-[0_0_40px_rgba(34,211,238,0.08)]'
                  }`}
                  title="Tap for Hands-Free Web Speech conversation"
                >
                  <Mic
                    className={`w-6 h-6 transition-colors ${
                      webSpeech.handsFree
                        ? 'text-cyan-300'
                        : 'text-zinc-300 group-hover:text-cyan-300'
                    }`}
                  />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2.5">
                How can I help, {currentUser?.displayName?.split(' ')[0] || 'Dustin'}?
              </h1>
              <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-9">
                Speak hands-free via Web Speech, stream Gemini Live audio, text, or drop any image to expand my IQ.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl text-left">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="p-3.5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 text-xs sm:text-[13px] text-zinc-300 hover:text-white leading-snug transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Conversation Thread */
            <div className="py-6 space-y-6 flex-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Uploaded Visual IQ Previews */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 max-w-[85%] justify-end">
                      {msg.attachments.map((att, idx) => (
                        <img
                          key={idx}
                          src={att.dataUrl}
                          alt={att.name}
                          className="max-h-48 rounded-2xl border border-zinc-800 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {msg.role === 'user' ? (
                    <div className="bg-zinc-800/90 text-zinc-100 px-4 py-3 rounded-2xl rounded-br-sm max-w-[85%] text-[14px] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="group max-w-full sm:max-w-[92%] space-y-2">
                      <div className="text-[14.5px] text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>

                      {/* Quiet Message Actions (Speak / Copy) */}
                      <div className="flex items-center gap-3 pt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          className={`text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                            webSpeech.speakingMessageId === msg.id || fallbackSpeakingId === msg.id
                              ? 'text-cyan-400'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Read aloud via SpeechSynthesis"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>
                            {webSpeech.speakingMessageId === msg.id || fallbackSpeakingId === msg.id
                              ? 'Stop Speaking'
                              : 'Listen'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Live Voice Active Orb Banner in Thread */}
              {isLiveVoiceActive && (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <button
                    onClick={stopLiveTalk}
                    className="relative w-16 h-16 rounded-full bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_45px_rgba(34,211,238,0.25)] cursor-pointer"
                    title="End Live Talk"
                  >
                    <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                    <Mic className="w-6 h-6 text-cyan-300 relative z-10" />
                  </button>
                  <span className="text-xs text-cyan-300 font-medium tracking-wide">
                    {liveStatus || 'Live Voice Active'} — Tap orb to end
                  </span>
                </div>
              )}

              {/* Subtle Thinking Indicator */}
              {isSending && (
                <div className="flex items-center gap-2 text-zinc-500 text-sm py-1">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Unified Multimodal Talk + Text Composer */}
      <div className="shrink-0 px-4 sm:px-6 pb-5 pt-2 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Live Web Speech Interim Dictation / Hands-Free Banner */}
          {(webSpeech.isListening || webSpeech.interimTranscript || webSpeech.voiceError) && (
            <div className="px-4 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Mic className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {webSpeech.voiceError ? (
                  <span className="text-amber-300 truncate">{webSpeech.voiceError}</span>
                ) : (
                  <span className="text-zinc-300 truncate">
                    {webSpeech.interimTranscript
                      ? `"${webSpeech.interimTranscript}"`
                      : webSpeech.handsFree
                        ? 'Hands-Free listening — speak naturally to send...'
                        : 'Dictating — speak now...'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={webSpeech.stopListening}
                className="text-zinc-400 hover:text-white shrink-0 cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          <div className="bg-zinc-900/90 border border-zinc-800 focus-within:border-zinc-700 rounded-3xl p-2.5 shadow-2xl transition-colors">
            {/* Staged Image Attachments */}
            {stagedAttachments.length > 0 && (
              <div className="flex items-center gap-2 px-2 pb-2.5 overflow-x-auto">
                {stagedAttachments.map((att) => (
                  <div key={att.id} className="relative shrink-0 group">
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-700"
                    />
                    <button
                      onClick={() =>
                        setStagedAttachments((prev) => prev.filter((x) => x.id !== att.id))
                      }
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-1.5">
              {/* Attach Image to IQ */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  processFiles(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                title="Add image or diagram to Agent IQ"
              >
                <ImagePlus className="w-5 h-5" />
              </button>

              {/* Auto-growing Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  webSpeech.handsFree
                    ? 'Hands-Free active — speak or type...'
                    : 'Message Nimbus iQ...'
                }
                className="flex-1 bg-transparent text-[15px] text-zinc-100 placeholder:text-zinc-500 py-2 px-1 focus:outline-none resize-none max-h-44 leading-relaxed"
              />

              {/* Web Speech Voice Dictation Button */}
              {webSpeech.isRecognitionSupported && (
                <button
                  type="button"
                  onClick={() => {
                    if (isLiveVoiceActive) stopLiveTalk();
                    webSpeech.toggleDictation();
                  }}
                  className={`p-2.5 rounded-2xl transition-all shrink-0 cursor-pointer ${
                    webSpeech.isListening
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title={
                    webSpeech.isListening
                      ? 'Stop Web Speech Dictation'
                      : 'Voice Input (Web Speech API)'
                  }
                >
                  {webSpeech.isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Gemini 3.8 Live Streaming Audio Button */}
              <button
                type="button"
                onClick={() => {
                  if (webSpeech.isListening || webSpeech.handsFree) {
                    webSpeech.stopListening();
                  }
                  toggleLiveTalk();
                }}
                className={`p-2.5 rounded-2xl transition-all shrink-0 cursor-pointer ${
                  isLiveVoiceActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={isLiveVoiceActive ? 'End Gemini Live Stream' : 'Gemini 3.8 Live Audio Stream'}
              >
                <Radio className="w-5 h-5" />
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={(!input.trim() && stagedAttachments.length === 0) || isSending}
                className="p-2.5 rounded-2xl bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 transition-all shrink-0 cursor-pointer"
                title="Send"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tucked-Away Slide-Over Drawer (Hidden unless user clicks top-right Brain icon) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0c0c10] border-l border-zinc-800/90 h-full flex flex-col p-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">Agent IQ &amp; Day-1 Memory</h2>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtle Account Cloud Sync Row */}
            <div className="py-3 border-b border-zinc-800/80 flex items-center justify-between text-xs">
              {currentUser ? (
                <>
                  <span className="text-zinc-300 truncate">
                    Synced as <strong className="text-white">{currentUser.email}</strong>
                  </span>
                  <button
                    onClick={onSignOut}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <span className="text-zinc-400">Sign in to sync Day-1 memory across devices</span>
                  <button
                    onClick={onSignIn}
                    className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign in</span>
                  </button>
                </>
              )}
            </div>

            {/* Drawer Mode Switch */}
            <div className="grid grid-cols-4 gap-1 bg-zinc-900 p-1 rounded-xl my-3 text-xs">
              <button
                onClick={() => setDrawerTab('memory')}
                className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  drawerTab === 'memory' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Memory
              </button>
              <button
                onClick={() => setDrawerTab('iq')}
                className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  drawerTab === 'iq' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Visual IQ
              </button>
              <button
                onClick={() => setDrawerTab('catalog')}
                className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  drawerTab === 'catalog' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Catalog
              </button>
              <button
                onClick={() => setDrawerTab('optimization')}
                className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  drawerTab === 'optimization'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Caching
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {drawerTab === 'memory' && (
                <>
                  <form onSubmit={handleSaveManualMemory} className="flex gap-2">
                    <input
                      type="text"
                      value={newMemoryNote}
                      onChange={(e) => setNewMemoryNote(e.target.value)}
                      placeholder="Teach a permanent fact or rule..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newMemoryNote.trim()}
                      className="px-3 py-2 rounded-xl bg-white disabled:opacity-40 text-zinc-950 text-xs font-medium cursor-pointer"
                    >
                      Save
                    </button>
                  </form>

                  {memories.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-cyan-400">{m.key}</span>
                        {onDeleteMemory && (
                          <button
                            onClick={() => onDeleteMemory(m.id)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition-opacity cursor-pointer"
                            title="Remove memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{m.content}</p>
                    </div>
                  ))}
                </>
              )}

              {drawerTab === 'iq' && (
                <>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-zinc-700 hover:border-cyan-500/50 text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ImagePlus className="w-4 h-4 text-cyan-400" />
                    <span>Upload Image or Diagram into Agent IQ</span>
                  </button>

                  {iqAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2"
                    >
                      {asset.imageDataUrl && (
                        <img
                          src={asset.imageDataUrl}
                          alt={asset.title}
                          className="max-h-32 rounded-lg object-contain border border-zinc-800"
                        />
                      )}
                      <div className="text-xs font-semibold text-white">{asset.title}</div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{asset.summary}</p>
                    </div>
                  ))}
                </>
              )}

              {drawerTab === 'catalog' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Canonical OS &amp; File-Check Catalog</span>
                      </span>
                      <button
                        onClick={refreshFileCatalog}
                        disabled={isLoadingCatalog}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        {isLoadingCatalog ? 'Scanning...' : 'Verify'}
                      </button>
                    </div>

                    {catalogReport ? (
                      <>
                        <div className="text-[11px] text-zinc-400">
                          {catalogReport.totalFiles} files &bull; {catalogReport.totalLines.toLocaleString()} lines &bull; Integrity{' '}
                          <span className="text-emerald-400 font-semibold">{catalogReport.integrityScore}%</span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {catalogReport.checks.map((chk) => (
                            <div
                              key={chk.id}
                              className="p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/80"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-zinc-200">{chk.label}</span>
                                <span className={chk.passed ? 'text-emerald-400' : 'text-rose-400'}>
                                  {chk.passed ? 'PASS' : 'FAIL'}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-400 mt-0.5">{chk.detail}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-[11px] text-zinc-400">Scanning project integrity...</div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(NIMBUS_PRIME_CANONICAL_PROMPT);
                      setCopiedCanonical(true);
                      setTimeout(() => setCopiedCanonical(false), 1800);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedCanonical ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCanonical ? 'Copied Canonical nimbusiq.ai Prompt' : 'Copy Canonical nimbusiq.ai Prompt'}</span>
                  </button>

                  {catalogReport && (
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                      <div className="text-[11px] text-zinc-400 font-medium pt-1">
                        Indexed Files ({catalogReport.entries.length})
                      </div>
                      {catalogReport.entries.slice(0, 60).map((entry) => (
                        <div
                          key={entry.path}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-[11px]"
                        >
                          <span className="text-zinc-300 truncate max-w-[230px]">{entry.path}</span>
                          <span className="text-zinc-500 shrink-0">{entry.sha256.slice(0, 8)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'optimization' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                    <div className="text-zinc-400">Gemini Context Cache + 80/20 Tiering</div>
                    <div className="text-xl font-semibold text-emerald-400">
                      ~{costReductionPct}% Token Cost Reduction
                    </div>
                    <p className="text-zinc-400 leading-relaxed pt-1">
                      Core domain corpora (Weather Mind Map, PSD 0–100, Agent Uriyah SMS, IRC R905.2.8.2 &amp; SATCALC, and Biological Cell SecOps) remain warm in server context cache.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-zinc-300 font-medium">Model Routing Mode</div>
                    {[
                      {
                        id: 'auto_80_20',
                        title: 'Automatic 80/20 Split',
                        desc: 'Fast Flash-Lite for quick chat; Deep Flash for complex audits & images',
                      },
                      {
                        id: 'flash_lite',
                        title: 'Ultra-Fast Flash-Lite',
                        desc: 'Lowest latency & maximum cost efficiency',
                      },
                      {
                        id: 'flash_deep',
                        title: 'Deep Reasoning Mode',
                        desc: 'High thinking depth on every turn',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSwitchRouting(opt.id as any)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                          routingMode === opt.id
                            ? 'bg-zinc-800 border-cyan-500/40 text-white'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="font-medium">{opt.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Web Speech Synthesis Voice & Speed Controls */}
                  {webSpeech.isSynthesisSupported && (
                    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-200 font-medium">Web Speech Synthesis</span>
                        <span className="text-zinc-400 font-mono">{webSpeech.speechRate.toFixed(2)}x</span>
                      </div>

                      {webSpeech.voices.length > 0 && (
                        <select
                          value={webSpeech.selectedVoiceURI}
                          onChange={(e) => webSpeech.setSelectedVoiceURI(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                        >
                          {webSpeech.voices
                            .filter((v) => v.lang.startsWith('en'))
                            .map((v) => (
                              <option key={v.voiceURI} value={v.voiceURI}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                        </select>
                      )}

                      <input
                        type="range"
                        min={0.75}
                        max={1.4}
                        step={0.05}
                        value={webSpeech.speechRate}
                        onChange={(e) => webSpeech.setSpeechRate(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
