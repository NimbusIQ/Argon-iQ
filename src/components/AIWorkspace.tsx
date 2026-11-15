import React, { useState, useRef, useEffect } from "react";
import { 
  Cpu, MessageSquare, Image as ImageIcon, Video, Music, Mic, Upload, Eye,
  Play, Square, Compass, Sparkles, Send, ShieldAlert, Check, Loader2, RefreshCw, Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  sender: "user" | "model";
  text: string;
  timestamp: Date;
  steps?: Array<{ type: string; summary?: string; signature?: string }>;
}

export default function AIWorkspace() {
  const [activeSubTab, setActiveSubTab] = useState<"chatbot" | "media" | "analysis" | "voice">("chatbot");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px] animate-[fadeIn_0.4s_ease-out]">
      {/* Sub navigation column */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-white mb-6">
            <Cpu className="text-cyan-400 w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider">AI Sovereign Suite</h3>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: "chatbot", label: "Multi-Model Chatbot", icon: <MessageSquare className="w-4 h-4" /> },
              { id: "media", label: "Media Studio (Veo/Lyria)", icon: <Sparkles className="w-4 h-4" /> },
              { id: "analysis", label: "Multimodal Lab", icon: <Eye className="w-4 h-4" /> },
              { id: "voice", label: "Live Voice Enclave", icon: <Volume2 className="w-4 h-4 text-emerald-400" /> },
            ].map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id as any)}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition-all flex items-center gap-3 font-mono text-xs uppercase ${
                  activeSubTab === subTab.id
                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400 font-bold"
                    : "bg-slate-950/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                }`}
              >
                {subTab.icon}
                <span>{subTab.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-[10px] font-mono text-slate-500 space-y-2">
            <span className="block text-cyan-400/80">SECURITY COMPLIANT</span>
            <p>API keys are fully proxy-secured. No client-side exposure occurs. WebM/WAV audio is streamed via secure Node.js enclaves.</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Column */}
      <div className="lg:col-span-9">
        <AnimatePresence mode="wait">
          {activeSubTab === "chatbot" && <ChatbotSub />}
          {activeSubTab === "media" && <MediaStudioSub />}
          {activeSubTab === "analysis" && <AnalysisLabSub />}
          {activeSubTab === "voice" && <VoiceEnclaveSub />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT 1: Multi-Model Chatbot
// ============================================================================
function ChatbotSub() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "model",
      text: "Welcome, operator. I am the Nimbus IQ Sovereign AI. How can I assist you with your roofing operations, technical specifications, or claims reconciliations today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.8-flash");
  const [systemRole, setSystemRole] = useState("advocate"); // advocate, spec, sovereign
  const [grounding, setGrounding] = useState<"none" | "search" | "maps">("none");
  const [thinking, setThinking] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roles = {
    advocate: "You are the leading Adjuster Advocate for Nimbus Roofing. You specialize in Texas Insurance Code Section 542, residential building code compliance (IRC R905.2.8.2 drip edge and IRC R905.1.2), and drafting legally binding code-based supplements to carrier estimators. Always quote relevant guidelines and code sections precisely.",
    spec: "You are a Technical Specification writer for Nimbusiq.ai. You write crisp, enterprise-grade SaaS documentation, Cloudflare configuration blueprints, and systems of record models. Structure your responses professionally with clean headings and lists.",
    sovereign: "You are the Sovereign Platform Architect. You consult on Cloud Run container deployments, Node.js WebSocket integration, React 19 client architectures, and Firestore database design. Provide highly optimized, complete, and correct code examples."
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: new Date()
    };

    const historyPayload = messages
      .filter((m) => m.id !== "welcome")
      .slice(-12)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: historyPayload,
          model: selectedModel,
          systemInstruction: roles[systemRole as keyof typeof roles],
          groundingType: grounding === "none" ? undefined : grounding,
          thinking: thinking
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to communicate with AI.");

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        sender: "model",
        text: data.outputText,
        timestamp: new Date(),
        steps: data.steps
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "model",
          text: `[LLM ERROR] ${err.message}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-6 flex flex-col h-[650px]"
    >
      {/* Top Config Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-white/5 font-mono text-xs">
        {/* Model Selector */}
        <div className="space-y-1">
          <label className="text-slate-500 text-[10px] uppercase">Active Model</label>
          <select 
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              if (e.target.value === "gemini-3.1-flash-lite") setThinking(false);
            }}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
          >
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Balanced)</option>
            <option value="gemini-flash-latest">Gemini Flash Latest</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast)</option>
          </select>
        </div>

        {/* Role Configurator */}
        <div className="space-y-1">
          <label className="text-slate-500 text-[10px] uppercase">Enclave Agent Persona</label>
          <select 
            value={systemRole}
            onChange={(e) => setSystemRole(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
          >
            <option value="advocate">Adjuster Advocate (Claims)</option>
            <option value="spec">Technical Writer (Specs)</option>
            <option value="sovereign">Sovereign Architect (Cloud)</option>
          </select>
        </div>

        {/* Grounding Toggle */}
        <div className="space-y-1">
          <label className="text-slate-500 text-[10px] uppercase">API Grounding Tools</label>
          <select 
            value={grounding}
            onChange={(e) => setGrounding(e.target.value as any)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
          >
            <option value="none">No Grounding</option>
            <option value="search">Google Search Data</option>
            <option value="maps">Google Maps Places</option>
          </select>
        </div>

        {/* Thinking Mode Toggle */}
        <div className="flex flex-col justify-end">
          <button
            disabled={selectedModel === "gemini-3.1-flash-lite"}
            onClick={() => setThinking(!thinking)}
            className={`w-full py-2.5 rounded-xl border transition-all text-center font-bold ${
              thinking 
                ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                : "bg-slate-950 border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
            }`}
          >
            Thinking Mode: {thinking ? "HIGH" : "OFF"}
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col max-w-[85%] ${
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
              msg.sender === "user" 
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-slate-950 border border-white/5 text-slate-300"
            }`}>
              {msg.text}
            </div>

            {/* Proof of Work step logs for Grounding / Thinking */}
            {msg.sender === "model" && msg.steps && msg.steps.length > 0 && (
              <div className="mt-2 space-y-1 w-full pl-2">
                {msg.steps.map((step, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[9px] font-mono text-cyan-400/70 bg-cyan-500/5 border border-cyan-400/10 px-2 py-0.5 rounded-md mr-1.5">
                    <Check className="w-2.5 h-2.5" />
                    <span>{step.type.toUpperCase()}: {step.summary || "Done"}</span>
                  </span>
                ))}
              </div>
            )}
            
            <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase">
              {msg.sender === "user" ? "Operator" : `Nimbus OS (${selectedModel})`} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-cyan-400/80 font-mono text-xs pl-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Nimbus IQ OS synthesizing response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="flex gap-2 border-t border-white/5 pt-4">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything, operator... (Use Enter)"
          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
        />
        <button 
          onClick={handleSend}
          className="p-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUB-COMPONENT 2: Media Studio (Veo/Lyria/Generators)
// ============================================================================
function MediaStudioSub() {
  const [mediaType, setMediaType] = useState<"image" | "video" | "music">("image");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [studioError, setStudioError] = useState<string>("");

  // Image Specifics
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");
  const [imageModel, setImageModel] = useState("gemini-3.1-flash-lite-image");
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);

  // Video Specifics (Omni Flash)
  const [videoResolution, setVideoResolution] = useState("720p");
  const [videoAspectRatio, setVideoAspectRatio] = useState("16:9");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>("");

  // Music Specifics (Lyria)
  const [musicModel, setMusicModel] = useState("lyria-3-clip-preview");
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [generatedLyrics, setGeneratedLyrics] = useState<string>("");

  // Convert File uploads to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Str = (reader.result as string).split(",")[1];
      setUploadedBase64(base64Str);
    };
  };

  // 1. Generate/Edit Image
  const handleGenerateImage = async () => {
    if (!prompt.trim() && !uploadedBase64) return;
    setLoading(true);
    setStudioError("");
    setGeneratedImg(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: imageModel,
          aspectRatio,
          size: imageSize,
          sourceImage: uploadedBase64 ? { data: uploadedBase64 } : undefined,
          editInstruction: uploadedBase64 ? prompt : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image generation failed.");
      setGeneratedImg(data.imageUrl);
    } catch (err: any) {
      setStudioError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Music (Lyria)
  const handleGenerateMusic = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setStudioError("");
    setGeneratedMusicUrl(null);
    setGeneratedLyrics("");

    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: musicModel,
          sourceImage: uploadedBase64 ? { data: uploadedBase64, mimeType: "image/jpeg" } : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Music generation failed.");

      setGeneratedMusicUrl(data.audioUrl);
      setGeneratedLyrics(data.lyrics || "");
    } catch (err: any) {
      setStudioError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Generate Video (Omni Flash)
  const handleGenerateVideo = async () => {
    if (!prompt.trim() && !uploadedBase64) return;
    setLoading(true);
    setStudioError("");
    setGeneratedVideoUrl(null);
    setPollingStatus("Synthesizing video via Gemini Omni Flash...");

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio: videoAspectRatio,
          resolution: videoResolution,
          sourceImage: uploadedBase64 ? { data: uploadedBase64 } : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Video synthesis failed.");
      if (!data.videoDataUrl) throw new Error("No video stream returned by model.");
      setGeneratedVideoUrl(data.videoDataUrl);
    } catch (err: any) {
      setStudioError(err.message);
    } finally {
      setLoading(false);
      setPollingStatus("");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-6"
    >
      {/* Media sub selector */}
      <div className="flex border-b border-white/5 pb-2 gap-4 text-xs font-mono">
        <button 
          onClick={() => { setMediaType("image"); setPrompt(""); setStudioError(""); }}
          className={`pb-2 uppercase ${mediaType === "image" ? "border-b-2 border-cyan-400 text-white font-bold" : "text-slate-500"}`}
        >
          Image Studio
        </button>
        <button 
          onClick={() => { setMediaType("video"); setPrompt(""); setStudioError(""); }}
          className={`pb-2 uppercase ${mediaType === "video" ? "border-b-2 border-cyan-400 text-white font-bold" : "text-slate-500"}`}
        >
          Omni Video Engine
        </button>
        <button 
          onClick={() => { setMediaType("music"); setPrompt(""); setStudioError(""); }}
          className={`pb-2 uppercase ${mediaType === "music" ? "border-b-2 border-cyan-400 text-white font-bold" : "text-slate-500"}`}
        >
          Lyria Music Clip
        </button>
      </div>

      {studioError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {studioError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left column: Configurations */}
        <div className="md:col-span-5 space-y-4 font-mono text-xs">
          {mediaType === "image" && (
            <>
              {/* Image Model */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">Studio Model Quality</label>
                <select 
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="gemini-3.1-flash-lite-image">Gemini 3.1 Flash Lite Image</option>
                  <option value="gemini-nano-banana-2.1">Gemini Nano Banana 2.1 (HQ)</option>
                  <option value="gemini-3-pro-image">Gemini 3 Pro Image</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">Control Aspect Ratio</label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {["1:1", "3:4", "4:3", "9:16", "16:9"].map(ar => (
                    <option key={ar} value={ar}>{ar}</option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">Resolution Size</label>
                <select 
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="1K">1K (1024px Standard)</option>
                  <option value="2K">2K (High Resolution)</option>
                  <option value="4K">4K (Ultra HD Studio)</option>
                </select>
              </div>
            </>
          )}

          {mediaType === "video" && (
            <>
              {/* Aspect Ratio */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">Video Aspect Ratio</label>
                <select 
                  value={videoAspectRatio}
                  onChange={(e) => setVideoAspectRatio(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="16:9">Landscape (16:9)</option>
                  <option value="9:16">Portrait (9:16)</option>
                </select>
              </div>

              {/* Resolution */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">Veo Frame Resolution</label>
                <select 
                  value={videoResolution}
                  onChange={(e) => setVideoResolution(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="720p">720p (Fast)</option>
                  <option value="1080p">1080p (HQ)</option>
                </select>
              </div>
            </>
          )}

          {mediaType === "music" && (
            <>
              {/* Model */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">Lyria Audio Model</label>
                <select 
                  value={musicModel}
                  onChange={(e) => setMusicModel(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="lyria-3-clip-preview">Lyria Clip (30s Snippet)</option>
                  <option value="lyria-3-pro-preview">Lyria Pro (Full-Length Track)</option>
                </select>
              </div>
            </>
          )}

          {/* Base64 Reference Image Uploader (Optional starter image / editor) */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-3">
            <span className="text-[10px] text-cyan-400 uppercase font-black tracking-wider block">Reference Image Upload (Optional)</span>
            <input 
              type="file" 
              accept="image/*" 
              id="media-uploader-input"
              onChange={handleFileUpload}
              className="hidden" 
            />
            <label 
              htmlFor="media-uploader-input"
              className="border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 transition-all text-slate-500 hover:text-slate-300"
            >
              <Upload className="w-6 h-6 text-slate-500" />
              <span>Drag & Drop or Click to Upload</span>
            </label>
            {uploadedBase64 && (
              <div className="flex items-center justify-between bg-[#0c0c12] p-2 rounded-xl border border-white/5">
                <span className="text-[9px] text-emerald-400 block truncate max-w-[120px]">Image Loaded</span>
                <button onClick={() => setUploadedBase64(null)} className="text-rose-400 hover:text-rose-300">Remove</button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Prompt input & Display */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-mono font-bold block uppercase">Prompt instruction</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mediaType === "image" ? "e.g., A high-fidelity architectural render of a futuristic luxury residential building under a stellar neon sunset..."
                : mediaType === "video" ? "e.g., A slow panning shot of rain dropping on a black asphalt roof, dramatic lighting, high details..."
                : "e.g., Generate a warm cinematic acoustic guitar riff for a brand outro..."
              }
              rows={3}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <button
            disabled={loading || (!prompt.trim() && !uploadedBase64)}
            onClick={
              mediaType === "image" ? handleGenerateImage
              : mediaType === "video" ? handleGenerateVideo
              : handleGenerateMusic
            }
            className="w-full py-3.5 bg-cyan-500 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-400 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? "Quantum processing..." : `Synthesize ${mediaType}`}</span>
          </button>

          {/* Results frame */}
          <div className="bg-slate-950 rounded-3xl border border-white/5 p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
            {loading && pollingStatus && (
              <div className="text-center space-y-3 z-10 animate-pulse font-mono text-xs">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                <p className="text-amber-400 font-black uppercase tracking-widest">{pollingStatus}</p>
                <p className="text-[10px] text-slate-500">Video synthesis can take up to 2-3 minutes. Please standby.</p>
              </div>
            )}

            {loading && !pollingStatus && (
              <div className="text-center space-y-2 z-10 font-mono text-xs">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
                <p className="text-cyan-400">Rendering digital asset...</p>
              </div>
            )}

            {!loading && !generatedImg && !generatedVideoUrl && !generatedMusicUrl && (
              <div className="text-center text-slate-600 font-mono text-xs">
                No active asset synthesis found. Type a prompt above.
              </div>
            )}

            {/* Render Image */}
            {generatedImg && (
              <div className="relative group w-full flex justify-center items-center">
                <img 
                  src={generatedImg} 
                  alt="Sovereign AI Render" 
                  referrerPolicy="no-referrer"
                  className="max-h-[300px] rounded-2xl object-contain border border-white/10"
                />
                <a 
                  href={generatedImg} 
                  download="nimbus-studio-render.png" 
                  className="absolute bottom-4 right-4 bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-[9px] text-white hover:bg-slate-900"
                >
                  Download 4K render
                </a>
              </div>
            )}

            {/* Render Video */}
            {generatedVideoUrl && (
              <div className="w-full space-y-4">
                <video 
                  src={generatedVideoUrl} 
                  controls 
                  className="w-full max-h-[300px] rounded-2xl border border-white/10"
                />
                <a 
                  href={generatedVideoUrl} 
                  download="veo-cinematic-shot.mp4" 
                  className="inline-block bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 font-mono text-[10px] px-3 py-1.5 rounded-xl hover:bg-cyan-500/20"
                >
                  Download Video File
                </a>
              </div>
            )}

            {/* Render Music */}
            {generatedMusicUrl && (
              <div className="w-full space-y-4 text-center">
                <Volume2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <audio src={generatedMusicUrl} controls className="w-full" />
                
                {generatedLyrics && (
                  <div className="bg-[#0c0c12]/80 border border-white/5 p-4 rounded-xl text-[10px] font-mono text-slate-400 max-h-32 overflow-y-auto leading-relaxed">
                    <span className="text-[9px] text-cyan-400 font-bold block mb-2">LYRICS & METADATA</span>
                    {generatedLyrics}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUB-COMPONENT 3: Multimodal Lab (Analysis & Transcription)
// ============================================================================
function AnalysisLabSub() {
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");

  // Record audio states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Convert File to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileMimeType(file.type);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Str = (reader.result as string).split(",")[1];
      setFileBase64(base64Str);
    };
  };

  // Trigger analysis on server
  const triggerAnalysis = async () => {
    if (!fileBase64) return;
    setLoading(true);
    setAnalysisResult("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: fileBase64,
          mimeType: fileMimeType,
          prompt: customPrompt,
          mediaType: mediaType,
          model: mediaType === "audio" ? "gemini-3.5-transcribe" : "gemini-3.8-flash"
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");

      setAnalysisResult(data.outputText);
    } catch (err: any) {
      setAnalysisResult(`[ERROR] ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setFileMimeType("audio/webm");

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onload = () => {
          const base64Str = (reader.result as string).split(",")[1];
          setFileBase64(base64Str);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setAnalysisResult("[MICROPHONE BLOCKED] Open the app in a new tab to grant microphone access.");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Automatically switch tab
      setMediaType("audio");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-6"
    >
      <div className="flex border-b border-white/5 pb-2 gap-4 text-xs font-mono">
        <button 
          onClick={() => { setMediaType("image"); setFileBase64(null); setAnalysisResult(""); }}
          className={`pb-2 uppercase ${mediaType === "image" ? "border-b-2 border-cyan-400 text-white font-bold" : "text-slate-500"}`}
        >
          Analyze Images (3.8 Flash)
        </button>
        <button 
          onClick={() => { setMediaType("video"); setFileBase64(null); setAnalysisResult(""); }}
          className={`pb-2 uppercase ${mediaType === "video" ? "border-b-2 border-cyan-400 text-white font-bold" : "text-slate-500"}`}
        >
          Analyze Videos (3.8 Flash)
        </button>
        <button 
          onClick={() => { setMediaType("audio"); setFileBase64(null); setAnalysisResult(""); }}
          className={`pb-2 uppercase ${mediaType === "audio" ? "border-b-2 border-cyan-400 text-white font-bold" : "text-slate-500"}`}
        >
          Transcribe Voice (3.5 Transcribe)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 font-mono text-xs">
        {/* Left column: uploaders & prompts */}
        <div className="md:col-span-5 space-y-4">
          {/* Audio Microphone recorder */}
          {mediaType === "audio" && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-center space-y-4">
              <span className="text-[10px] text-cyan-400 uppercase font-black block">Live Mic Transcription</span>
              
              <div className="flex justify-center gap-2">
                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-1.5 hover:bg-emerald-500/20"
                  >
                    <Mic className="w-4 h-4 animate-pulse" />
                    Record Mic
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-xl flex items-center gap-1.5 hover:bg-rose-500/30 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Stop & Transcribe
                  </button>
                )}
              </div>
              <p className="text-[9px] text-slate-500">Record spoken audio. Let Gemini Flash transcribe it to pristine text instantly.</p>
            </div>
          )}

          {/* Standard File Input */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-3">
            <span className="text-[10px] text-cyan-400 uppercase font-black block">Upload File Source</span>
            <input 
              type="file" 
              accept={mediaType === "image" ? "image/*" : mediaType === "video" ? "video/*" : "audio/*"}
              id="analysis-file-input"
              onChange={handleFileChange}
              className="hidden" 
            />
            <label 
              htmlFor="analysis-file-input"
              className="border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 transition-all text-slate-500 text-center"
            >
              <Upload className="w-6 h-6 text-slate-500" />
              <span>Select {mediaType.toUpperCase()} file</span>
            </label>
            {fileBase64 && (
              <div className="flex items-center justify-between bg-[#0c0c12] p-2 rounded-xl border border-white/5 text-[9px]">
                <span className="text-emerald-400 truncate max-w-[130px]">{fileMimeType || "File ready"}</span>
                <button onClick={() => setFileBase64(null)} className="text-rose-400 hover:text-rose-300">Clear</button>
              </div>
            )}
          </div>

          {/* prompt instruction */}
          <div className="space-y-1">
            <label className="text-slate-500 text-[10px] uppercase">Custom Analysis directive</label>
            <input 
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Identify materials in this roof photo..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <button
            disabled={loading || !fileBase64}
            onClick={triggerAnalysis}
            className="w-full py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl text-center uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-400 transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Initiate Gemini Analysis"}
          </button>
        </div>

        {/* Right column: analysis readout */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-white/5 p-6 min-h-[300px] flex flex-col justify-start">
            <span className="text-[10px] text-cyan-400/80 font-bold uppercase block pb-3 border-b border-white/5 mb-4">Sovereign Analysis Ledger</span>

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 text-cyan-400/80">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>Interpreting quantum frame matrices...</span>
              </div>
            )}

            {!loading && !analysisResult && (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-center">
                Waiting for analysis. Please load a file and click initiate.
              </div>
            )}

            {!loading && analysisResult && (
              <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                {analysisResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUB-COMPONENT 4: Live Voice Enclave (Real-Time Voice API via WebSockets)
// ============================================================================
function VoiceEnclaveSub() {
  const [active, setActive] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [modelTranscript, setModelTranscript] = useState<string>("");
  const [voiceLog, setVoiceLog] = useState<string[]>([]);
  const [micBlocked, setMicBlocked] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  // Initialize and connect WebSocket & audio
  const startSession = async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Establish socket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      // Audio capture (16kHz for Live API)
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = inputCtx;

      // Audio playback (24kHz for Live API output)
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      nextStartTimeRef.current = outputCtx.currentTime;

      // Mic processor
      const source = inputCtx.createMediaStreamSource(stream);
      micSourceRef.current = source;

      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      micProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert PCM Float32 to Int16
          const base64Audio = pcmToBase64(inputData);
          ws.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      ws.onopen = () => {
        setActive(true);
        setVoiceLog(prev => [...prev, "Connected to Sovereign Voice Enclave. Speaking active."]);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.audio) {
            playAudioChunk(outputCtx, msg.audio);
          }

          if (msg.userTranscription) {
            setUserTranscript(msg.userTranscription);
            setVoiceLog(prev => [...prev, `Operator: ${msg.userTranscription}`]);
          }

          if (msg.modelTranscription) {
            setModelTranscript(msg.modelTranscription);
            setVoiceLog(prev => [...prev, `Sovereign AI: ${msg.modelTranscription}`]);
          }

          if (msg.interrupted) {
            // Cancel pending playbacks
            nextStartTimeRef.current = outputCtx.currentTime;
            setVoiceLog(prev => [...prev, "[AI INTERRUPTED]"]);
          }

          if (msg.error) {
            setVoiceLog(prev => [...prev, `[ERROR] ${msg.error}`]);
          }
        } catch (err) {
          console.error("WS message parse error:", err);
        }
      };

      ws.onclose = () => {
        setVoiceLog(prev => [...prev, "Sovereign voice link closed."]);
        cleanupSession();
      };

      ws.onerror = (e) => {
        setVoiceLog(prev => [...prev, "WebSocket communication error occurrd."]);
      };

    } catch (err) {
      console.error(err);
      setMicBlocked(true);
      setVoiceLog(prev => [...prev, "[ERROR] Microphone or network connection blocked in iframe."]);
    }
  };

  const stopSession = () => {
    cleanupSession();
  };

  const cleanupSession = () => {
    setActive(false);
    
    if (socketRef.current) {
      try { socketRef.current.close(); } catch (e) {}
      socketRef.current = null;
    }

    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }

    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
  };

  // Helper: Convert PCM Float32 to Base64 Int16
  const pcmToBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    // Encode to base64
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Helper: Play Int16 Base64 audio chunk via WebAudio AudioBufferSourceNode
  const playAudioChunk = (ctx: AudioContext, base64Audio: string) => {
    try {
      const binary = window.atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32Array.length, 24000); // Live API is 24kHz
      buffer.copyToChannel(float32Array, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      // Schedule gapless playback
      const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;
    } catch (err) {
      console.error("Audio playback chunk error:", err);
    }
  };

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-6 text-center"
    >
      <div className="max-w-md mx-auto space-y-6">
        <Volume2 className={`w-16 h-16 mx-auto ${active ? "text-emerald-400 animate-pulse scale-110" : "text-slate-600"} transition-all`} />

        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Quantum Voice Link Enclave</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Have low-latency, real-time voice conversations directly with the Gemini 3.1 Live API. Talk freely — model replies with spoken voice output in milliseconds.
          </p>
        </div>

        {micBlocked && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl flex items-start gap-2.5 text-left font-sans">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-bold block uppercase text-[10px]">IFrame Permissions Blocked</span>
              If your mic isn't starting, open the applet directly in a new tab by clicking the external link at the top-right of your preview frame.
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3">
          {!active ? (
            <button 
              onClick={startSession}
              className="px-6 py-3 bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase rounded-2xl flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all"
            >
              <Mic className="w-4 h-4" />
              Establish Voice Link
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="px-6 py-3 bg-rose-500 text-slate-950 font-mono text-xs font-black uppercase rounded-2xl flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-400 transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              Terminate Link
            </button>
          )}
        </div>

        {/* Live Conversation Readouts */}
        <div className="grid grid-cols-2 gap-4 text-left font-mono text-[10px] uppercase">
          <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-1">
            <span className="text-cyan-400 font-bold block">Operator Transcript</span>
            <p className="text-slate-400 lowercase normal-case text-xs min-h-[40px]">
              {userTranscript || "awaiting operator speech..."}
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-1">
            <span className="text-emerald-400 font-bold block">Sovereign Transcript</span>
            <p className="text-slate-400 lowercase normal-case text-xs min-h-[40px]">
              {modelTranscript || "awaiting sovereign voice..."}
            </p>
          </div>
        </div>

        {/* Event log */}
        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-left font-mono text-[9px] max-h-40 overflow-y-auto space-y-1 text-slate-500">
          <span className="text-cyan-400/70 font-black block mb-2">SYSTEM TELEMETRY LOG</span>
          {voiceLog.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-700 font-bold">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
