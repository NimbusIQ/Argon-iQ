"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChatMode = "roofing" | "coding_agent";
type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

// ─── Quick-reply suggestions per mode ─────────────────────────────────────────
const ROOFING_SUGGESTIONS = [
  "Do I have hail damage?",
  "How does the insurance claim work?",
  "Scan my roof at my address",
  "Schedule a free inspection",
];

const CODING_SUGGESTIONS = [
  "Build a FastAPI REST API with JWT auth",
  "Create a React dashboard with TailwindCSS",
  "Scaffold a full-stack Next.js + PostgreSQL app",
  "Build a Python CLI tool for image compression",
];

// ─── Initial greeting messages ─────────────────────────────────────────────
const ROOFING_GREETING = `👋 Hi! I'm **NimbusIQ**, your AI roofing assistant.

I can help you with:
- **Hail damage** assessment and next steps
- **Insurance claims** — we handle the entire process
- **Free roof inspections** in McKinney & DFW
- **Property scans** — just give me your address

What can I help you with today?`;

const CODING_GREETING = `⚡ **Gemini Coding Agent** online.

I'm powered by **Gemini 2.5 Flash** with four intelligence pillars:
🌐 **Grounding** · 👻 **Ghost Mode** · 🧠 **Wisdom Engine** · ⚡ **Predictive**

Tell me what to build — text, voice transcript, or describe a UI mockup. I'll scaffold the full project with production-ready code.

What are we building today?`;

// ─── Utility ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Component ────────────────────────────────────────────────────────────────
export default function NimbusChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("roofing");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialise greeting when mode changes or widget first opens
  useEffect(() => {
    const greeting = mode === "roofing" ? ROOFING_GREETING : CODING_GREETING;
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
      },
    ]);
  }, [mode]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide pulse dot after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      // Placeholder for streaming assistant response
      const assistantId = uid();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
      ]);

      try {
        const payload = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/gemini_chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payload, mode }),
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6);
            if (raw === "[DONE]") break;
            try {
              const { text } = JSON.parse(raw);
              if (text) {
                fullText += text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullText } : m
                  )
                );
              }
            } catch {
              // partial JSON — skip
            }
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "I'm having trouble connecting right now. Please call us at **(214) 612-6696** for immediate assistance.",
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [messages, mode, isStreaming]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const suggestions =
    mode === "roofing" ? ROOFING_SUGGESTIONS : CODING_SUGGESTIONS;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open NimbusIQ Chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
          boxShadow: "0 0 24px rgba(14,165,233,0.5)",
        }}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {showPulse && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-ping" />
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: "min(420px, calc(100vw - 24px))",
            height: "min(600px, calc(100vh - 120px))",
            background: "#0f172a",
            border: "1px solid rgba(14,165,233,0.3)",
            boxShadow: "0 0 40px rgba(14,165,233,0.15)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0c1a2e 0%, #0f2a4a 100%)", borderBottom: "1px solid rgba(14,165,233,0.2)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}
              >
                N
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-tight">
                  {mode === "roofing" ? "NimbusIQ Assistant" : "Gemini Coding Agent"}
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  <span className="text-green-400 text-xs">
                    {isStreaming ? "Thinking..." : "Online"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode toggle */}
            <div
              className="flex rounded-lg overflow-hidden text-xs font-medium"
              style={{ border: "1px solid rgba(14,165,233,0.3)" }}
            >
              <button
                onClick={() => setMode("roofing")}
                className="px-3 py-1.5 transition-colors"
                style={{
                  background: mode === "roofing" ? "rgba(14,165,233,0.25)" : "transparent",
                  color: mode === "roofing" ? "#38bdf8" : "#64748b",
                }}
              >
                🏠 Roofing
              </button>
              <button
                onClick={() => setMode("coding_agent")}
                className="px-3 py-1.5 transition-colors"
                style={{
                  background: mode === "coding_agent" ? "rgba(99,102,241,0.25)" : "transparent",
                  color: mode === "coding_agent" ? "#a5b4fc" : "#64748b",
                }}
              >
                ⚡ Agent
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a5f transparent" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: "linear-gradient(135deg, #0ea5e9, #2563eb)", color: "white", borderBottomRightRadius: "4px" }
                      : { background: "rgba(255,255,255,0.06)", color: "#e2e8f0", borderBottomLeftRadius: "4px", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content || "▋"}</ReactMarkdown>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions (only when last message is from assistant and not streaming) */}
          {!isStreaming && messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(14,165,233,0.1)",
                    border: "1px solid rgba(14,165,233,0.3)",
                    color: "#7dd3fc",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div
            className="flex items-end gap-2 px-3 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(14,165,233,0.15)", background: "rgba(0,0,0,0.3)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "roofing"
                  ? "Ask about hail damage, insurance, or your roof..."
                  : "Describe what to build (text, voice transcript, or UI description)..."
              }
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(14,165,233,0.25)",
                color: "#e2e8f0",
                maxHeight: "120px",
                lineHeight: "1.5",
              }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isStreaming || !input.trim()
                  ? "rgba(14,165,233,0.2)"
                  : "linear-gradient(135deg, #0ea5e9, #2563eb)",
              }}
            >
              {isStreaming ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>

          {/* Footer branding */}
          <div
            className="text-center py-1.5 text-xs flex-shrink-0"
            style={{ color: "#334155", borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            Powered by{" "}
            <span style={{ color: "#0ea5e9" }}>NimbusIQ</span> · Gemini 2.5
          </div>
        </div>
      )}
    </>
  );
}
