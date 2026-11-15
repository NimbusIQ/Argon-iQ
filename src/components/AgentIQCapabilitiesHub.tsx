import React, { useState, useRef, useEffect } from 'react';
import {
  Brain, Upload, Sparkles, Mic, MicOff, Volume2, MessageSquare, Send,
  CloudLightning, Globe, Zap, Layers, CheckCircle2, RefreshCw, ArrowRight,
  PhoneCall, Shield, Cpu, Database, FileText, Copy, Check, Radio
} from 'lucide-react';
import {
  AgentIQAsset,
  MemoryRecord,
  CacheCorpusEntry,
  AIOptimizationMetrics,
  SmsIntakeRecord,
  LeverageContentItem,
} from '../types';
import { INITIAL_CACHE_CORPORA } from '../data';

interface AgentIQCapabilitiesHubProps {
  mode: 'iq_brain' | 'talk_text' | 'leverage_content' | 'ai_optimization';
  iqAssets: AgentIQAsset[];
  memories: MemoryRecord[];
  smsLogs: SmsIntakeRecord[];
  leverageCampaigns: LeverageContentItem[];
  onAddIQAsset: (asset: AgentIQAsset) => void;
  onAddMemory: (memory: MemoryRecord) => void;
  onAddSmsLog: (record: SmsIntakeRecord) => void;
  onAddLeverageCampaign: (item: LeverageContentItem) => void;
  onDispatchBlueprintTask: (prompt: string, agentId?: string) => void;
}

interface ConsoleChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  tier?: string;
  cacheHit?: boolean;
  latencyMs?: number;
  timestamp: string;
}

export default function AgentIQCapabilitiesHub({
  mode,
  iqAssets,
  memories,
  smsLogs,
  leverageCampaigns,
  onAddIQAsset,
  onAddMemory,
  onAddSmsLog,
  onAddLeverageCampaign,
  onDispatchBlueprintTask,
}: AgentIQCapabilitiesHubProps) {
  // ── 1. Visual IQ Brain & Bio-Cell State ──
  const [selectedAssetId, setSelectedAssetId] = useState<string>(iqAssets[0]?.id || '');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [previewImage, setPreviewImage] = useState<{ base64: string; mimeType: string; dataUrl: string } | null>(null);
  const [isIngestingImage, setIsIngestingImage] = useState(false);
  const [ingestFeedback, setIngestFeedback] = useState<string | null>(null);

  const [isBioPulseRunning, setIsBioPulseRunning] = useState(false);
  const [bioPulseResult, setBioPulseResult] = useState<{
    cellTitle: string;
    detectedSignal: string;
    autonomousAction: string;
    generatedCodeArtifact: string;
    verificationCheck: string;
    memoryKey: string;
  } | null>(null);

  // ── 2. Talk & Text + Agent Uriyah SMS State ──
  const [isLiveVoiceActive, setIsLiveVoiceActive] = useState(false);
  const [liveStatusText, setLiveStatusText] = useState('Standby — Ready for 16kHz/24kHz Bidirectional Voice');
  const [liveTranscripts, setLiveTranscripts] = useState<Array<{ speaker: 'Operator' | 'SuperAgent'; text: string }>>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState(false);
  const [speakingTurnId, setSpeakingTurnId] = useState<string | null>(null);
  const [chatTurns, setChatTurns] = useState<ConsoleChatTurn[]>([
    {
      id: 'init-turn',
      role: 'model',
      text: 'SuperAgent Talk & Text link online. All 3 Day-1 Visual IQ blueprints (Weather Mind Map, GCP 75% Context Caching + 80/20 Tiering, and Biological Cell SecOps) are pinned in active context cache.',
      tier: '80_FAST_FLASH_LITE',
      cacheHit: true,
      latencyMs: 64,
      timestamp: 'Ready',
    },
  ]);

  const [smsPhone, setSmsPhone] = useState('+1 (214) 555-0192');
  const [smsCity, setSmsCity] = useState('Frisco, TX');
  const [smsInboundText, setSmsInboundText] = useState(
    'Quarter to golf ball hail just hit near Preston Rd and shingles are in our yard. Can we get an inspection?'
  );
  const [isSmsProcessing, setIsSmsProcessing] = useState(false);

  // ── 3. Leverage Content & PSD Geo-SEO State ──
  const [targetCity, setTargetCity] = useState('Plano, TX (75024)');
  const [radarStation, setRadarStation] = useState('KFWS (DFW NEXRAD)');
  const [hailInches, setHailInches] = useState<number>(1.75);
  const [windMph, setWindMph] = useState<number>(64);
  const [reflectivityDbz, setReflectivityDbz] = useState<number>(60);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(leverageCampaigns[0]?.id || '');
  const [copiedSlug, setCopiedSlug] = useState(false);

  // ── 4. AI Optimization & Context Caching State ──
  const [optMetrics, setOptMetrics] = useState<AIOptimizationMetrics>({
    routingMode: 'auto_80_20',
    totalRequests: 4581,
    flashLiteRequests: 3665,
    deepReasoningRequests: 916,
    cacheHits: 4412,
    tokensProcessed: 18420000,
    cachedTokensSaved: 13815000,
    estimatedActualCostUsd: 1.84,
    unoptimizedBaselineUsd: 7.36,
    costReductionPct: 75,
  });
  const [corpora, setCorpora] = useState<CacheCorpusEntry[]>(INITIAL_CACHE_CORPORA);
  const [isUpdatingOpt, setIsUpdatingOpt] = useState(false);

  const selectedAsset = iqAssets.find((a) => a.id === selectedAssetId) || iqAssets[0];
  const selectedCampaign =
    leverageCampaigns.find((c) => c.id === selectedCampaignId) || leverageCampaigns[0];

  // Fetch live optimization stats when opening optimization or talk_text
  useEffect(() => {
    fetch('/api/llm/optimization')
      .then((r) => r.json())
      .then((data) => {
        if (data?.metrics) setOptMetrics(data.metrics);
        if (Array.isArray(data?.corpora)) setCorpora(data.corpora);
      })
      .catch(() => {});
  }, [mode]);

  // Cleanup Live Voice WebSocket on unmount
  useEffect(() => {
    return () => {
      stopLiveVoice();
    };
  }, []);

  // Deterministic live PSD preview calculation
  const previewPsdRaw =
    hailInches * 28 +
    Math.max(0, windMph - 35) * 0.85 +
    Math.max(0, reflectivityDbz - 40) * 0.9;
  const previewPsdScore = Math.max(5, Math.min(100, Math.round(previewPsdRaw)));
  const previewRiskBand =
    previewPsdScore >= 80
      ? 'SEVERE'
      : previewPsdScore >= 55
      ? 'HIGH'
      : previewPsdScore >= 30
      ? 'MEDIUM'
      : 'LOW';

  // ── Handlers: Image Upload into Agent IQ ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const base64 = dataUrl.split(',')[1] || '';
      setPreviewImage({
        base64,
        mimeType: file.type || 'image/jpeg',
        dataUrl,
      });
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleIngestImageToIQ = async () => {
    if (!previewImage) return;
    setIsIngestingImage(true);
    setIngestFeedback(null);

    try {
      const res = await fetch('/api/agent/ingest-iq-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: previewImage.base64,
          mimeType: previewImage.mimeType,
          customTitle: uploadTitle,
          operatorNotes: uploadNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze image');

      const ext = data.extracted;
      const newAssetId = `iq-${Date.now().toString().slice(-5)}`;
      const newAsset: AgentIQAsset = {
        id: newAssetId,
        title: ext.title || uploadTitle || 'Ingested Visual Blueprint',
        sourceLabel: `Operator Multimodal Upload • ${data.latencyMs}ms`,
        category: 'uploaded_visual',
        summary: ext.summary,
        extractedNodes: ext.extractedNodes || [],
        formulasOrRules: ext.formulasOrRules || [],
        ingestedAt: 'Just now',
        dayOneOrigin: true,
        imageDataUrl: previewImage.dataUrl,
        tags: ext.tags || ['Visual-IQ', 'Gemini Vision'],
      };

      onAddIQAsset(newAsset);
      setSelectedAssetId(newAssetId);

      onAddMemory({
        id: `mem-iq-${Date.now().toString().slice(-4)}`,
        key: ext.memoryKey || `visual_iq_${Date.now().toString().slice(-4)}`,
        category: 'blueprint',
        content: ext.memoryDigest || ext.summary,
        relevanceScore: 0.99,
        lastAccessed: 'Just now',
        tags: ['Image-IQ', ...(ext.tags || []).slice(0, 3)],
        dayOneLineage: true,
        sourceAssetId: newAssetId,
      });

      setIngestFeedback(`Ingested "${newAsset.title}" into Agent IQ & Day-1 Memory.`);
      setPreviewImage(null);
      setUploadTitle('');
      setUploadNotes('');
    } catch (err: any) {
      setIngestFeedback(`Ingestion error: ${err.message}`);
    } finally {
      setIsIngestingImage(false);
    }
  };

  // ── Handler: Zero-Prompt Biological Cell Autonomous Pulse ──
  const handleRunBioCellPulse = async () => {
    setIsBioPulseRunning(true);
    try {
      const res = await fetch('/api/agent/bio-cell-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeClaimsCount: 5,
          memoryCount: memories.length,
          latestCity: targetCity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pulse failed');

      setBioPulseResult(data.pulse);
      onAddMemory({
        id: `mem-cell-${Date.now().toString().slice(-4)}`,
        key: data.pulse.memoryKey || 'bio_cell_autonomous_evolution',
        category: 'episodic',
        content: data.pulse.memoryDigest,
        relevanceScore: 0.98,
        lastAccessed: 'Just now',
        tags: ['Biological Cell', 'Zero-Prompt', 'Day-1 History'],
        dayOneLineage: true,
      });
    } catch (err: any) {
      setBioPulseResult({
        cellTitle: 'Signal Check Error',
        detectedSignal: err.message,
        autonomousAction: 'Retry when Gemini endpoint is reachable.',
        generatedCodeArtifact: '// Connection retry required',
        verificationCheck: 'N/A',
        memoryKey: 'err',
      });
    } finally {
      setIsBioPulseRunning(false);
    }
  };

  // ── Handlers: Unary TTS Playback & Live Voice WebSocket ──
  const speakTextAloud = async (turnId: string, text: string) => {
    if (!text.trim() || speakingTurnId) return;
    setSpeakingTurnId(turnId);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Zephyr' }),
      });
      const data = await res.json();
      if (res.ok && data.audioDataUrl) {
        const audio = new Audio(data.audioDataUrl);
        audio.onended = () => setSpeakingTurnId(null);
        audio.onerror = () => setSpeakingTurnId(null);
        await audio.play();
      } else {
        setSpeakingTurnId(null);
      }
    } catch {
      setSpeakingTurnId(null);
    }
  };

  const playPcm24kChunk = (base64Pcm: string) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
    }
    const ctx = audioCtxRef.current;
    const binary = atob(base64Pcm);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, nextPlayTimeRef.current);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + buffer.duration;
  };

  const startLiveVoice = async () => {
    try {
      setLiveStatusText('Connecting to Gemini 3.8 Live Enclave...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/live`);
      wsRef.current = ws;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      nextPlayTimeRef.current = 0;

      ws.onopen = () => {
        setIsLiveVoiceActive(true);
        setLiveStatusText('LIVE VOICE ACTIVE — Speak naturally with SuperAgent');

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
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
            playPcm24kChunk(msg.audio);
          }
          if (msg.userTranscription) {
            setLiveTranscripts((prev) => [
              ...prev.slice(-12),
              { speaker: 'Operator', text: msg.userTranscription },
            ]);
          }
          if (msg.modelTranscription) {
            setLiveTranscripts((prev) => [
              ...prev.slice(-12),
              { speaker: 'SuperAgent', text: msg.modelTranscription },
            ]);
          }
          if (msg.error) {
            setLiveStatusText(`Live Error: ${msg.error}`);
          }
        } catch {}
      };

      ws.onclose = () => {
        setIsLiveVoiceActive(false);
        setLiveStatusText('Voice Session Disconnected');
      };
    } catch (err: any) {
      setIsLiveVoiceActive(false);
      setLiveStatusText(`Mic / Socket Error: ${err.message || 'Check microphone permission'}`);
    }
  };

  const stopLiveVoice = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsLiveVoiceActive(false);
    setLiveStatusText('Standby — Ready for 16kHz/24kHz Bidirectional Voice');
  };

  // ── Handler: Cached 80/20 Text Chat ──
  const handleSendTextTurn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const prompt = chatInput.trim();
    setChatInput('');
    const userTurn: ConsoleChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatTurns((prev) => [...prev, userTurn]);
    setIsChatSending(true);

    try {
      const memorySnippet = memories
        .slice(0, 5)
        .map((m) => `[${m.key}]: ${m.content}`)
        .join('\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: chatTurns.slice(-8).map((t) => ({ role: t.role, text: t.text })),
          useTierRouter: true,
          memoryDigestContext: memorySnippet,
          systemInstruction:
            'You are SuperAgent by Nimbus iQ AI. Answer concisely using your ingested Weather Mind Map, PSD 0-100, Agent Uriyah SMS, IRC R905.2.8.2, SATCALC, and GCP 75% Caching / Biological Cell IQ.',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');

      const turnId = `m-${Date.now()}`;
      const replyTurn: ConsoleChatTurn = {
        id: turnId,
        role: 'model',
        text: data.outputText || 'Completed.',
        tier: data.tier,
        cacheHit: data.cacheHit,
        latencyMs: data.latencyMs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatTurns((prev) => [...prev, replyTurn]);

      if (autoSpeakReplies && data.outputText) {
        speakTextAloud(turnId, data.outputText);
      }
    } catch (err: any) {
      setChatTurns((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: `Error: ${err.message}`,
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // ── Handler: Agent Uriyah SMS Intake ──
  const handleRunSmsIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsInboundText.trim() || isSmsProcessing) return;
    setIsSmsProcessing(true);
    try {
      const res = await fetch('/api/sms/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: smsPhone,
          city: smsCity,
          inboundText: smsInboundText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'SMS routing failed');
      if (data.record) {
        onAddSmsLog(data.record);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSmsProcessing(false);
    }
  };

  // ── Handler: Leverage Content & PSD Geo-SEO Generator ──
  const handleGenerateLeverageContent = async () => {
    setIsGeneratingContent(true);
    try {
      const res = await fetch('/api/content/leverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCity,
          radarStation,
          hailSizeInches: hailInches,
          windSpeedMph: windMph,
          reflectivityDbz,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Content generation failed');
      if (data.campaign) {
        onAddLeverageCampaign(data.campaign);
        setSelectedCampaignId(data.campaign.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // ── Handler: Optimization Config Update ──
  const handleUpdateOptimization = async (payload: {
    routingMode?: 'auto_80_20' | 'flash_lite' | 'flash_deep';
    toggleCorpusId?: string;
  }) => {
    setIsUpdatingOpt(true);
    try {
      const res = await fetch('/api/llm/optimization/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.metrics) setOptMetrics(data.metrics);
      if (Array.isArray(data?.corpora)) setCorpora(data.corpora);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingOpt(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 1: AGENT IQ VISUAL BRAIN & BIOLOGICAL CELL PULSE
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === 'iq_brain') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Ingested Visual Blueprints List + Multimodal Uploader (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>Day-1 Visual IQ Blueprints ({iqAssets.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">Active in Prompt Cache</span>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {iqAssets.map((asset) => {
                  const active = selectedAsset?.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        active
                          ? 'bg-blue-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                          : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-white truncate">
                          {asset.title}
                        </span>
                        {asset.dayOneOrigin && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                            DAY-1 IQ
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2">{asset.summary}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>{asset.sourceLabel}</span>
                        <span>{asset.extractedNodes.length} branches</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multimodal Image-to-IQ Uploader */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Add Image / Diagram to Agent IQ</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Gemini 3.8 Vision</span>
              </div>

              <label className="block border border-dashed border-zinc-700 hover:border-cyan-500/50 rounded-xl p-4 text-center cursor-pointer bg-zinc-950/50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewImage ? (
                  <div className="space-y-2">
                    <img
                      src={previewImage.dataUrl}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded-lg border border-zinc-800 object-contain"
                    />
                    <span className="text-[11px] font-mono text-cyan-400 block">
                      Image staged — Ready for Multimodal IQ Extraction
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1 py-2">
                    <Upload className="w-5 h-5 text-zinc-400 mx-auto" />
                    <span className="text-xs font-mono text-zinc-300 block">
                      Drop mind map, slide, whiteboard note, or storm photo
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block">
                      Extracts branches, formulas & Day-1 memory embeddings
                    </span>
                  </div>
                )}
              </label>

              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Optional Blueprint Title (e.g., DFW Hail Triage Matrix)"
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
              />

              <input
                type="text"
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Optional context notes for SuperAgent..."
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
              />

              <button
                onClick={handleIngestImageToIQ}
                disabled={!previewImage || isIngestingImage}
                className="w-full bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-mono text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isIngestingImage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Nodes & Indexing into IQ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ingest Visual into Permanent Agent IQ</span>
                  </>
                )}
              </button>

              {ingestFeedback && (
                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
                  {ingestFeedback}
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Visual IQ Knowledge Graph & Biological Cell Pulse (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {selectedAsset && (
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                      {selectedAsset.sourceLabel}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                      {selectedAsset.title}
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      onDispatchBlueprintTask(
                        `Execute operational workflow from Agent IQ Blueprint "${selectedAsset.title}": ${selectedAsset.summary}`,
                        selectedAsset.category === 'workflow_mindmap'
                          ? 'agent-sentinel-weather'
                          : 'agent-orchestrator'
                      )
                    }
                    className="bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Execute Blueprint in Task Loop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {selectedAsset.imageDataUrl && (
                  <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 p-2">
                    <img
                      src={selectedAsset.imageDataUrl}
                      alt={selectedAsset.title}
                      className="max-h-52 mx-auto object-contain rounded-lg"
                    />
                  </div>
                )}

                <p className="text-xs text-zinc-300 leading-relaxed">{selectedAsset.summary}</p>

                {/* Structured Mind-Map Branches */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                    Extracted Knowledge Graph Branches
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedAsset.extractedNodes.map((node, i) => (
                      <div
                        key={i}
                        className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-3.5 space-y-2"
                      >
                        <div className="text-xs font-mono font-bold text-cyan-400">
                          {node.branch}
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-zinc-300 leading-relaxed">
                          {node.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-1.5">
                              <span className="text-teal-400 font-mono mt-0.5">&rarr;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Encoded Formulas & Invariants */}
                {selectedAsset.formulasOrRules.length > 0 && (
                  <div className="bg-zinc-950/90 border border-emerald-500/25 rounded-xl p-3.5 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      Encoded Deterministic Rules & Formulas
                    </span>
                    {selectedAsset.formulasOrRules.map((rule, idx) => (
                      <div key={idx} className="text-xs font-mono text-zinc-200">
                        &bull; {rule}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Biological Cell Zero-Prompt Autonomous Operations Card */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-400" />
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      Biological Cell SecOps Engine (No-Prompt Signal Autonomy)
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Scott Barneson (Google + Wiz) model: Self-evolving cell inspects active storm & security telemetry, generates its own verified code/guard, and logs Day-1 lineage without manual prompts.
                  </p>
                </div>

                <button
                  onClick={handleRunBioCellPulse}
                  disabled={isBioPulseRunning}
                  className="bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isBioPulseRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Replicating Cell...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Trigger Zero-Prompt Cell Pulse</span>
                    </>
                  )}
                </button>
              </div>

              {bioPulseResult && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-teal-400 font-bold">
                    <span>[CELL EVOLUTION]: {bioPulseResult.cellTitle}</span>
                    <span className="text-[10px] text-emerald-400">Day-1 Memory Stamped</span>
                  </div>
                  <div className="text-zinc-300 font-sans">
                    <strong className="text-zinc-100">Signal:</strong> {bioPulseResult.detectedSignal}
                  </div>
                  <div className="text-zinc-300 font-sans">
                    <strong className="text-zinc-100">Autonomous Action:</strong> {bioPulseResult.autonomousAction}
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-cyan-300 overflow-x-auto">
                    {bioPulseResult.generatedCodeArtifact}
                  </pre>
                  <div className="text-[11px] text-emerald-400">
                    Verification: {bioPulseResult.verificationCheck}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 2: UNIFIED TALK & TEXT + AGENT URIYAH SMS INTAKE
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === 'talk_text') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Voice Talk + Cached Text Console (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Voice Bidirectional Link */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${isLiveVoiceActive ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    SuperAgent Live Talk (Gemini 3.8 Live Audio)
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{liveStatusText}</p>
              </div>

              {isLiveVoiceActive ? (
                <button
                  onClick={stopLiveVoice}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
                >
                  <MicOff className="w-4 h-4" />
                  <span>End Voice Session</span>
                </button>
              ) : (
                <button
                  onClick={startLiveVoice}
                  className="bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Live Voice Talk</span>
                </button>
              )}
            </div>

            {liveTranscripts.length > 0 && (
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5 text-xs font-mono">
                {liveTranscripts.map((t, idx) => (
                  <div key={idx}>
                    <span className={t.speaker === 'SuperAgent' ? 'text-cyan-400 font-bold' : 'text-blue-400 font-bold'}>
                      {t.speaker}:{' '}
                    </span>
                    <span className="text-zinc-200 font-sans">{t.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Turn Text Console with TTS Readback */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Cached 80/20 Text Console + TTS Voice Readback
                </h4>
                <span className="text-[11px] text-zinc-400">
                  Every reply uses pinned Context Cache &amp; supports 24kHz Zephyr TTS voice readback
                </span>
              </div>

              <button
                onClick={() => setAutoSpeakReplies(!autoSpeakReplies)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono border flex items-center gap-1.5 cursor-pointer ${
                  autoSpeakReplies
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Auto-Speak: {autoSpeakReplies ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {chatTurns.map((turn) => (
                <div
                  key={turn.id}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    turn.role === 'user'
                      ? 'bg-blue-950/30 border-blue-500/30 text-white ml-8'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-200 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] font-mono text-zinc-400">
                    <span>{turn.role === 'user' ? 'OPERATOR' : 'SUPERAGENT'}</span>
                    <div className="flex items-center gap-2">
                      {turn.cacheHit && (
                        <span className="text-emerald-400">CACHE HIT (-75%)</span>
                      )}
                      {turn.tier && (
                        <span className="text-cyan-400">
                          {turn.tier === '80_FAST_FLASH_LITE' ? '80% Fast Tier' : '20% Deep Tier'}
                        </span>
                      )}
                      {turn.role === 'model' && (
                        <button
                          onClick={() => speakTextAloud(turn.id, turn.text)}
                          className="text-zinc-300 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          title="Read aloud via Gemini TTS"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${speakingTurnId === turn.id ? 'text-cyan-400 animate-bounce' : ''}`} />
                          <span>Speak</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap">{turn.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendTextTurn} className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Text SuperAgent about PSD scores, IRC R905, caching unit economics, or claims..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatSending}
                className="bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isChatSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Agent Uriyah SMS Intake & CRM Router (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Agent Uriyah SMS Intake Workflow</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">WPCode / Sovereign REST</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Simulates Branch 4 of the Weather Mind Map: classifies homeowner storm SMS, computes urgency, and dispatches instant inspection booking links + CRM lead alerts.
              </p>
            </div>

            <form onSubmit={handleRunSmsIntake} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  placeholder="Sender Phone"
                />
                <input
                  type="text"
                  value={smsCity}
                  onChange={(e) => setSmsCity(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  placeholder="City / ZIP"
                />
              </div>

              <textarea
                rows={3}
                value={smsInboundText}
                onChange={(e) => setSmsInboundText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-white resize-none focus:border-cyan-500 focus:outline-none"
                placeholder="Inbound homeowner SMS..."
              />

              <button
                type="submit"
                disabled={isSmsProcessing || !smsInboundText.trim()}
                className="w-full bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-zinc-950 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSmsProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Agent Uriyah Classifying Intent...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Route Inbound SMS via Agent Uriyah</span>
                  </>
                )}
              </button>
            </form>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 pt-2 border-t border-zinc-800">
              {smsLogs.map((sms) => (
                <div
                  key={sms.id}
                  className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-zinc-300">{sms.senderPhone} &bull; {sms.city}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      sms.urgency === 'EMERGENCY'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {sms.urgency} • PSD {sms.psdEstimate}
                    </span>
                  </div>
                  <p className="text-zinc-400 italic">"{sms.inboundText}"</p>
                  <div className="p-2.5 rounded-lg bg-teal-950/30 border border-teal-500/25 text-teal-200 font-mono text-[11px]">
                    {sms.automatedReply}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Intent: {sms.intentCategory}</span>
                    <span className="text-emerald-400">{sms.crmLeadId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 3: LEVERAGE CONTENT & PSD (0-100) GEO-SEO ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === 'leverage_content') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: NOAA Signal + PSD 0-100 Calculator (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                <CloudLightning className="w-4 h-4" />
                <span>NOAA Radar &rarr; PSD Score (0–100)</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Sentinel Trigger</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-zinc-400 block mb-1">Target Municipality &amp; ZIP:</label>
                <input
                  type="text"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Hail Diameter (Inches)</span>
                  <span className="text-cyan-400 font-bold">{hailInches.toFixed(2)}"</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.25}
                  value={hailInches}
                  onChange={(e) => setHailInches(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>IoT / Gust Wind Velocity</span>
                  <span className="text-cyan-400 font-bold">{windMph} MPH</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={95}
                  step={1}
                  value={windMph}
                  onChange={(e) => setWindMph(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>NOAA NEXRAD Reflectivity</span>
                  <span className="text-cyan-400 font-bold">{reflectivityDbz} dBZ</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={72}
                  step={1}
                  value={reflectivityDbz}
                  onChange={(e) => setReflectivityDbz(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Live PSD Gauge */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                  Property Storm Damage Score
                </span>
                <div className="text-3xl font-bold font-mono text-white">
                  {previewPsdScore}
                  <span className="text-sm text-zinc-500">/100</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                  previewRiskBand === 'SEVERE'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : previewRiskBand === 'HIGH'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {previewRiskBand} BAND
              </span>
            </div>

            <button
              onClick={handleGenerateLeverageContent}
              disabled={isGeneratingContent}
              className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGeneratingContent ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Hyper-Local Geo-SEO Page...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Generate &amp; Push Geo-SEO Leverage Page</span>
                </>
              )}
            </button>
          </div>

          {/* Published Campaigns List */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
              Published Geo-SEO Pages ({leverageCampaigns.length})
            </span>
            {leverageCampaigns.map((camp) => (
              <div
                key={camp.id}
                onClick={() => setSelectedCampaignId(camp.id)}
                className={`p-3 rounded-xl border cursor-pointer text-xs font-mono transition-all ${
                  selectedCampaign?.id === camp.id
                    ? 'bg-blue-950/30 border-cyan-500/50 text-white'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{camp.targetCity}</span>
                  <span className="text-cyan-400">PSD {camp.psdScore}/100</span>
                </div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">{camp.slugPath}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Generated Geo-SEO Landing Page & SMS Outreach Preview (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCampaign && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    {selectedCampaign.status} &bull; {selectedCampaign.publishTargets.join(' + ')}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedCampaign.seoTitle}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `${selectedCampaign.heroHeadline}\n\n${selectedCampaign.bodyMarkdown}`
                    );
                    setCopiedSlug(true);
                    setTimeout(() => setCopiedSlug(false), 1800);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedSlug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSlug ? 'Copied Copy' : 'Copy Payload'}</span>
                </button>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono space-y-1">
                <div className="text-cyan-400">URL Slug: {selectedCampaign.slugPath}</div>
                <div className="text-zinc-400 font-sans">Meta: {selectedCampaign.metaDescription}</div>
              </div>

              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {selectedCampaign.heroHeadline}
                </h4>
                <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {selectedCampaign.bodyMarkdown}
                </div>
              </div>

              <div className="bg-teal-950/25 border border-teal-500/30 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">
                  Paired Agent Uriyah Outbound / Inbound SMS Trigger Copy
                </span>
                <p className="text-xs font-mono text-zinc-200">{selectedCampaign.smsOutreachCopy}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 4: CONTEXT CACHING & 80/20 AI OPTIMIZATION (GCP UNIT ECONOMICS)
  // ═══════════════════════════════════════════════════════════════════════════
  const flashRatio =
    optMetrics.totalRequests > 0
      ? Math.round((optMetrics.flashLiteRequests / optMetrics.totalRequests) * 100)
      : 80;
  const deepRatio = 100 - flashRatio;

  return (
    <div className="space-y-6">
      {/* Top Unit EconomicsKPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
            Token Cost Reduction
          </span>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {optMetrics.costReductionPct}%
          </div>
          <span className="text-[11px] text-zinc-400">
            Gemini Context Caching + 80/20 Split
          </span>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
            Model Tiering Ratio
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {flashRatio}% <span className="text-xs text-cyan-400">Flash</span> / {deepRatio}%{' '}
            <span className="text-xs text-blue-400">Deep</span>
          </div>
          <span className="text-[11px] text-zinc-400">Target 80/20 Enterprise Trajectory</span>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
            Cached Tokens Saved
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {(optMetrics.cachedTokensSaved / 1_000_000).toFixed(2)}M
          </div>
          <span className="text-[11px] text-zinc-400">
            {optMetrics.cacheHits.toLocaleString()} verified cache hits
          </span>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
            Runway Unit Spend
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            ${optMetrics.estimatedActualCostUsd.toFixed(2)}{' '}
            <span className="text-xs text-zinc-500 line-through">
              ${optMetrics.unoptimizedBaselineUsd.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400"> Cloud Run Scale-to-Zero Active</span>
        </div>
      </div>

      {/* Cost Reduction Trajectory & Routing Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              GCP Cost Reduction Trajectory
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live implementation of your Google for Startups Unit Economics architecture.
            </p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>1. Unoptimized Single-Model</span>
                <span>100% Baseline TCO</span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full w-full bg-zinc-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-cyan-300 mb-1">
                <span>2. Multi-Model 80/20 Tiering</span>
                <span>~48% TCO</span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full w-[48%] bg-cyan-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-emerald-400 font-bold mb-1">
                <span>3. Multi-Model + Gemini Context Cache</span>
                <span>{100 - optMetrics.costReductionPct}% TCO (-{optMetrics.costReductionPct}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.max(18, 100 - optMetrics.costReductionPct)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <span className="text-xs font-mono text-zinc-300 font-bold block">
              Active Model Router Policy:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'auto_80_20',
                  label: 'Auto 80/20 Split (Recommended)',
                  desc: '80% Flash-Lite ($0.075/1M) + 20% High-Thinking Flash',
                },
                {
                  id: 'flash_lite',
                  label: '100% Ultra-Fast Flash-Lite',
                  desc: 'Maximum throughput & lowest cost for high-volume SMS/triage',
                },
                {
                  id: 'flash_deep',
                  label: '100% High-Thinking Forensic Mode',
                  desc: 'Maximum reasoning depth on every request',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  disabled={isUpdatingOpt}
                  onClick={() => handleUpdateOptimization({ routingMode: opt.id as any })}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    optMetrics.routingMode === opt.id
                      ? 'bg-blue-950/30 border-cyan-500/50 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{opt.label}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Pinned Context Cache Domain Corpora (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Pinned Gemini Context Cache Corpora
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Domain corpora kept warm in context cache so repetitive system specs, IRC codes, and mind-map schemas are never billed at uncached rates.
              </p>
            </div>
            <Database className="w-5 h-5 text-cyan-400 shrink-0" />
          </div>

          <div className="space-y-3">
            {corpora.map((corpus) => (
              <div
                key={corpus.id}
                className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{corpus.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      ~{(corpus.tokenEstimate / 1000).toFixed(1)}k tokens
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{corpus.summary}</p>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Category: {corpus.category} &bull; Cache Hits: {corpus.hitCount.toLocaleString()} &bull; Savings: -{corpus.costReductionPct}%
                  </div>
                </div>

                <button
                  disabled={isUpdatingOpt}
                  onClick={() => handleUpdateOptimization({ toggleCorpusId: corpus.id })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border shrink-0 cursor-pointer ${
                    corpus.pinned
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  {corpus.pinned ? 'PINNED IN CACHE' : 'UNPINNED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
