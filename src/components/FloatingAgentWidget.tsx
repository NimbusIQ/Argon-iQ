import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Sparkles, Cpu, Shield, Minimize2, 
  Maximize2, ArrowRight, CornerDownLeft, Bot, User, Check, RefreshCw, Terminal, Sliders
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  action?: {
    type: 'NAVIGATE' | 'APPLY_PRESET' | 'AUDIT_CLAIM';
    label: string;
    payload?: any;
  };
}

interface FloatingAgentWidgetProps {
  currentTab: string;
  onNavigateTab: (tab: any) => void;
  onSelectClaim?: (claimId: string) => void;
  onTriggerPreset?: (preset: 'basic' | 'complex' | 'mansion') => void;
}

const SYSTEM_PROMPT = `
You are SuperAgent by Nimbus IQ, an autonomous Technical Concierge and Senior Systems Architect for Nimbus IQ AI, LLC.
Operational Directive: Combine high-precision autonomous AI execution (Firebase + Google Cloud Run + Vertex AI) with engineering-grade building science (IRC R905, SATCALC trigonometry, forensic insurance supplements).

Core Operating Principles:
1. Efficiency First: Do not write unnecessary code or make redundant API calls.
2. Context Before Action: Retrieve relevant memory and AST representations first.
3. Tool-Driven Execution: Prefer deterministic tools over LLM hallucination.
4. Evidence Before Claims: Cite validated rules, benchmarks, and building codes.
5. Invariant Verification: Verify schemas, test suites, and math before completion.
6. Photonic-Void Protocol: Zero-plaintext secret leakage. Never reveal raw API tokens or internal credentials.

Financial Reconciliation:
- Revised RCV = Original Insurer RCV + Forensic Supplement Delta
- Final Payout = Revised RCV - Deductible - Depreciation Previously Held

SATCALC Trig:
- Slope Factor SF = sqrt(Rise^2 + 144) / 12
- Hip/Valley Multiplier HVF = sqrt(2 + (Rise/12)^2)

Keep responses crisp, authoritative, technical, and under 130 words unless detailed analysis is requested.
`;

export default function FloatingAgentWidget({ 
  currentTab, 
  onNavigateTab, 
  onSelectClaim, 
  onTriggerPreset 
}: FloatingAgentWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: 'SuperAgent Autonomous Control Surface active. Running on Vertex AI & Cloud Run enclaves. Photonic-Void Protocol active. How can I assist with your autonomous tasks, tool routing, or forensic building code audits today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Context-aware suggestion chips based on active tab
  const getSuggestionChips = () => {
    if (currentTab === 'superagent') {
      return [
        { label: 'Audit Firebase Security Rules', action: () => handleSendPresetMessage('Explain how the SuperAgent Code Graph Inspector audits firestore.rules and enforces RBAC permissions.') },
        { label: 'Cloud Run Microservice Deploy', action: () => handleSendPresetMessage('How does the Cloud Run Deployer agent enforce zero-scaling and human approval gates for high-risk mutations?') },
        { label: 'Vector RAG Knowledge Retrieval', action: () => handleSendPresetMessage('What memory collections are indexed in Firestore for long-term episodic RAG?') },
        { label: 'Internal Sovereign Stack vs Make/Twilio', action: () => handleSendPresetMessage('What internal sovereign alternatives does Nimbus deploy instead of Make and Twilio?') }
      ];
    }
    if (currentTab === 'satcalc') {
      return [
        { label: 'Calculate 8/12 slope on 2,800 sq ft', action: () => handleSendPresetMessage('Explain the exact SATCALC slope factor and true square formula for an 8/12 pitch on a 2,800 sq ft two-story footprint.') },
        { label: 'Apply Complex Roof Preset', action: () => { onTriggerPreset?.('complex'); handleSendPresetMessage('Apply the Complex Multi-Facet Roof preset in SATCALC.'); } },
        { label: 'IRC R905.2.8.2 Valley Requirements', action: () => handleSendPresetMessage('What are the valley linear footage and underlayment mandates under IRC R905.2.8.2?') },
      ];
    }
    if (currentTab === 'claims') {
      return [
        { label: 'Reconcile RCV Depreciation Delta', action: () => handleSendPresetMessage('How does the formula Revised RCV = Initial Estimate + Supplement Delta ensure full recoverable depreciation release?') },
        { label: 'Audit Ice & Water Shield Line-Item', action: () => handleSendPresetMessage('Why do carriers frequently omit IRC R905.2.8.2 Ice & Water Shield, and how do we counter with a forensic supplement?') },
        { label: 'Audit Enitan Claim #1', action: () => { onSelectClaim?.('enitan'); handleSendPresetMessage('Inspect the forensic audit for the Enitan property in Arlington.'); } },
      ];
    }
    return [
      { label: 'Launch SuperAgent Workspace', action: () => { onNavigateTab('superagent'); handleSendPresetMessage('Open SuperAgent Sovereign Console.'); } },
      { label: 'Audit IRC R905.2.8.2 Mandates', action: () => handleSendPresetMessage('Explain how IRC R905.2.8.2 mandates Ice & Water Shield in storm restoration claims.') },
      { label: 'Run SATCALC Trig Engine', action: () => { onNavigateTab('satcalc'); handleSendPresetMessage('Switch to SATCALC v2 Trig Engine to calculate 3D slope factor.'); } },
      { label: 'Alternative to Make & Twilio', action: () => handleSendPresetMessage('What internal sovereign alternatives does Nimbus deploy instead of Make and Twilio?') }
    ];
  };

  const handleSendPresetMessage = (text: string) => {
    handleSendMessage(text);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const lower = query.toLowerCase();
      let triggeredAction: Message['action'] = undefined;

      if (lower.includes('superagent') || lower.includes('task') || lower.includes('orchestrator') || lower.includes('timeline')) {
        triggeredAction = {
          type: 'NAVIGATE',
          label: 'Open SuperAgent Console',
          payload: 'superagent'
        };
      } else if (lower.includes('satcalc') || lower.includes('trig') || lower.includes('pitch')) {
        triggeredAction = {
          type: 'NAVIGATE',
          label: 'Open SATCALC v2 Engine',
          payload: 'satcalc'
        };
      } else if (lower.includes('claim') || lower.includes('rcv') || lower.includes('supplement') || lower.includes('coc')) {
        triggeredAction = {
          type: 'NAVIGATE',
          label: 'Open Claims Dashboard',
          payload: 'claims'
        };
      } else if (lower.includes('command') || lower.includes('domain') || lower.includes('cloudflare')) {
        triggeredAction = {
          type: 'NAVIGATE',
          label: 'Open Command Center',
          payload: 'cloudflare'
        };
      }

      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1')
        .slice(-10)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Active View: ${currentTab}] ${query}`,
          history: historyPayload,
          model: 'gemini-3.8-flash',
          systemInstruction: SYSTEM_PROMPT,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reach Gemini API.');
      }

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.outputText || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: triggeredAction
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `agent-err-${Date.now()}`,
          sender: 'agent',
          text: `LLM Connection Error: ${err.message || 'Unable to generate response.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: Message['action']) => {
    if (!action) return;
    if (action.type === 'NAVIGATE') {
      onNavigateTab(action.payload);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      
      {/* Floating Chat Container */}
      {isOpen && (
        <div 
          className={`bg-[#0c0c14] border border-cyan-500/30 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(34,211,238,0.15)] flex flex-col overflow-hidden transition-all duration-200 mb-3 backdrop-blur-2xl ${
            isMinimized 
              ? 'w-80 h-14' 
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950/80 via-zinc-900/90 to-cyan-950/80 p-3.5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500/20 to-cyan-400/20 border border-cyan-500/30 text-cyan-400">
                <Cpu className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white font-mono tracking-tight">SuperAgent Intelligence</span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono font-medium">v3.0</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Vertex AI Pro &bull; Cloud Run</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)} 
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs font-sans">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {msg.sender === 'agent' ? (
                        <>
                          <Bot className="w-3 h-3 text-cyan-400" />
                          <span className="text-[10px] font-mono text-zinc-400">SuperAgent</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-mono text-zinc-400">Operator</span>
                          <User className="w-3 h-3 text-blue-400" />
                        </>
                      )}
                      <span className="text-[9px] text-zinc-600 font-mono">{msg.timestamp}</span>
                    </div>

                    <div 
                      className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none font-medium' 
                          : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-none font-normal'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Attached Action Pill */}
                      {msg.action && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-800/80">
                          <button
                            onClick={() => handleActionClick(msg.action)}
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>{msg.action.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono p-2 bg-zinc-900/40 rounded-xl w-fit">
                    <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                    <span>SuperAgent reasoning via Vertex AI...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion Chips */}
              <div className="px-3 py-2 bg-zinc-950/80 border-t border-zinc-800/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
                {getSuggestionChips().map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={chip.action}
                    className="text-[10px] font-mono bg-zinc-900 hover:bg-zinc-800 hover:border-cyan-500/40 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-all flex-shrink-0 cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
              >
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask SuperAgent or dispatch task..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 font-mono transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-zinc-950 rounded-xl font-bold transition-all cursor-pointer"
                  title="Send Message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}

        </div>
      )}

      {/* Floating Launcher Trigger Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-zinc-950 p-3.5 rounded-full shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Open SuperAgent"
        >
          <div className="relative">
            <Cpu className="w-5 h-5 fill-current" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#09090b] animate-ping" />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider pr-1 hidden sm:inline">
            SuperAgent AI
          </span>
        </button>
      )}

    </div>
  );
}
