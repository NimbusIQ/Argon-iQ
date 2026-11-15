import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Headphones,
  Volume2,
  VolumeX,
  Copy,
  Check,
  MessageSquare,
  Plus,
  Terminal as TerminalIcon,
  Globe,
  Monitor,
  ShieldCheck,
  Code2,
  ArrowUpRight,
  LogIn,
  LogOut,
  Loader2,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  NimbusBotBlueprint,
  ViewportTab,
  SovereignStep,
  GeneratedAppSpec,
  BrowserDomRow,
  AuditLedgerRecord,
  DataResidency,
} from '../packages/vertical-blueprints/schema';
import { NIMBUS_BOTS, isDomainAllowed } from '../packages/vertical-blueprints/bots';
import { MemoryRecord } from '../types';
import { useWebSpeech } from '../hooks/useWebSpeech';

interface StudioMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  botHandle?: string;
  steps?: SovereignStep[];
  requiresHitl?: boolean;
  hitlResolved?: 'approved' | 'rejected';
  pendingCommand?: string;
}

interface NimbusSovereignStudioProps {
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  memories: MemoryRecord[];
  onAddMemory: (mem: MemoryRecord) => void;
  onSwitchToConversational: () => void;
}

const CUSTOM_BOTS_STORAGE_KEY = 'nimbus_iq_foundry_cartridges_v1';

const DEFAULT_APP_SPEC: GeneratedAppSpec = {
  appTitle: 'Sovereign Multi-Tenant Wire & Compliance Console',
  subtitle: 'VPC-Isolated Runtime · Tenant-Scoped RBAC · Zero-Retention Enforced',
  primaryActionLabel: 'Verify & Settle Batch',
  metrics: [
    { label: 'Escrow Settled (24h)', value: '$14,820,400', delta: '+4.2% verified' },
    { label: 'Policy Violations', value: '0 Blocked', delta: 'Zero-Trust active' },
    { label: 'P99 Inference Latency', value: '184 ms', delta: '75% cache hit' },
  ],
  rows: [
    {
      entity: 'Apex Semiconductor Corp',
      stage: 'Dual-Key Treasury Gate',
      metric: '$480,000.00',
      status: 'VERIFIED',
    },
    {
      entity: 'Meridian BioLabs AG',
      stage: 'EU-Sovereign Residency Check',
      metric: '$192,500.00',
      status: 'CLEARED',
    },
    {
      entity: 'D1 NIL Collective Escrow',
      stage: 'NCAA Compliance Rule Check',
      metric: '$65,000.00',
      status: 'READY',
    },
  ],
  adkCode: `// Synthesized by Nimbus iQ Sovereign Core (ADK + MCP + A2A)
import { LlmAgent } from '@google/adk';
import { NIMBUS_BOTS } from '@/src/packages/vertical-blueprints/bots';
import { createSovereignComputerTools } from '@/src/packages/computer-sdk/tools';

export function createTenantRuntime(tenantId: string) {
  const blueprint = NIMBUS_BOTS['sovereign-builder'];
  const tools = createSovereignComputerTools(tenantId, blueprint);

  return new LlmAgent({
    name: 'nimbus_sovereign_vertical',
    model: 'gemini-4-hydrogen',
    instruction: blueprint.systemPrompt,
    tools: Object.values(tools),
  });
}`,
};

const DEFAULT_BROWSER_ROWS: BrowserDomRow[] = [
  {
    vendor: 'CloudScale Infra Inc.',
    sku: 'GPU-H200-CLUSTER',
    qty: '4 Racks',
    total: '$148,000',
    status: 'AWAITING_HITL',
  },
  {
    vendor: 'ZeroTrust Vault Ltd.',
    sku: 'HSM-FIPS-140-3',
    qty: '12 Nodes',
    total: '$36,400',
    status: 'SOC2_VERIFIED',
  },
  {
    vendor: 'Apex Telemetry Corp',
    sku: 'OTEL-ENTERPRISE',
    qty: 'Annual',
    total: '$28,900',
    status: 'FLAGGED_DELTA',
  },
];

const INITIAL_AUDIT_RECORDS: AuditLedgerRecord[] = [
  {
    id: 'aud-1',
    ts: '14:22:01.04',
    plane: 'CORE',
    action: 'Initialized VPC-Isolated Firecracker Enclave (Zero-Retention)',
    status: 'VERIFIED',
    hash: '0x9f8a...3c1e',
  },
  {
    id: 'aud-2',
    ts: '14:22:02.19',
    plane: 'RAG',
    action: 'Vector Retrieval: enterprise-security-patterns (Top-K=6)',
    status: 'VERIFIED',
    hash: '0x4b2d...8a09',
  },
  {
    id: 'aud-3',
    ts: '14:22:03.41',
    plane: 'BROWSER',
    action: 'Vault Credential Injection -> procurement.internal.corp (Opaque Handle)',
    status: 'VERIFIED',
    hash: '0x7e11...f52b',
  },
];

function loadSavedCartridges(): Record<string, NimbusBotBlueprint> {
  try {
    const raw = localStorage.getItem(CUSTOM_BOTS_STORAGE_KEY);
    if (!raw) return NIMBUS_BOTS;
    const parsed = JSON.parse(raw) as Record<string, NimbusBotBlueprint>;
    return { ...NIMBUS_BOTS, ...parsed };
  } catch {
    return NIMBUS_BOTS;
  }
}

export default function NimbusSovereignStudio({
  currentUser,
  onSignIn,
  onSignOut,
  memories,
  onAddMemory,
  onSwitchToConversational,
}: NimbusSovereignStudioProps) {
  const [view, setView] = useState<'frontpage' | 'studio'>('frontpage');
  const [bots, setBots] = useState<Record<string, NimbusBotBlueprint>>(() => loadSavedCartridges());
  const [activeBotId, setActiveBotId] = useState<string>('sovereign-builder');
  const activeBot = bots[activeBotId] || bots['sovereign-builder'];

  // Prompt & Conversation State
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<StudioMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Studio Right-Pane Viewport State
  const [activeTab, setActiveTab] = useState<ViewportTab>('preview');
  const [previewMode, setPreviewMode] = useState<'ui' | 'code' | 'architecture'>('ui');
  const [appSpec, setAppSpec] = useState<GeneratedAppSpec>(DEFAULT_APP_SPEC);
  const [appBatchVerified, setAppBatchVerified] = useState(false);

  // Browser Agent State
  const [browserUrl, setBrowserUrl] = useState('https://procurement.internal.corp/po/pending');
  const [browserUrlDraft, setBrowserUrlDraft] = useState(
    'https://procurement.internal.corp/po/pending'
  );
  const [browserDomainNotice, setBrowserDomainNotice] = useState<string | null>(null);
  const [browserRows, setBrowserRows] = useState<BrowserDomRow[]>(DEFAULT_BROWSER_ROWS);

  // Computer VNC State
  const [desktopControlUser, setDesktopControlUser] = useState(false);
  const [desktopCursor, setDesktopCursor] = useState<{ x: number; y: number }>({ x: 640, y: 380 });
  const [desktopStatusLine, setDesktopStatusLine] = useState(
    'RECONCILIATION COMPLETE: 2 Discrepancies Isolated ($14,210.00 variance)'
  );

  // Interactive Terminal State
  const [terminalCmd, setTerminalCmd] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'nimbus-os@firecracker-vm-09:~$ uname -a',
    'Linux nimbus-sovereign-enclave 6.8.0-hardened #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
    'nimbus-os@firecracker-vm-09:~$ vault status --zero-retention',
    'Status: SEALED_EPHEMERAL | Residency: VPC-Isolated | Outbound Egress: Allowlist-Only',
  ]);

  // Audit Ledger State
  const [auditLogs, setAuditLogs] = useState<AuditLedgerRecord[]>(INITIAL_AUDIT_RECORDS);

  // Modals: Foundry Builder & Deploy AaaS
  const [showFoundryModal, setShowFoundryModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [newBotDraft, setNewBotDraft] = useState({
    handle: '@sec-ops',
    name: 'Nimbus SecOps Sentinel',
    tagline: 'Autonomous CVE Triage, Repo Patching & Sandbox Verification',
    residency: 'vpc-isolated' as DataResidency,
    defaultTab: 'terminal' as ViewportTab,
    systemPrompt:
      'You are @sec-ops, a Zero-Trust Vulnerability & Patch verification agent running inside a hardened Firecracker MicroVM.',
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const launchPromptRef = useRef<(customPrompt?: string, fromVoice?: boolean) => Promise<void>>(
    async () => {}
  );

  // Web Speech API (Hands-Free Voice Input + SpeechSynthesis)
  const webSpeech = useWebSpeech({
    defaultAutoSpeak: false,
    onFinalTranscript: (transcript, isHandsFreeMode) => {
      if (isHandsFreeMode) {
        launchPromptRef.current(transcript, true);
      } else {
        handlePromptChange(promptInput ? `${promptInput} ${transcript}` : transcript);
      }
    },
  });

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Sync server audit log when switching to audit tab
  useEffect(() => {
    if (activeTab !== 'audit') return;
    fetch('/api/bot/audit')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.records) && data.records.length > 0) {
          setAuditLogs(data.records);
        }
      })
      .catch(() => {});
  }, [activeTab]);

  // Auto-detect @bot handle typed in omnibox
  const handlePromptChange = (val: string) => {
    setPromptInput(val);
    const match = val.match(/^(@[a-z0-9-]+)\s/i);
    if (match) {
      const found = Object.values(bots).find(
        (b) => b.handle.toLowerCase() === match[1].toLowerCase()
      );
      if (found && found.id !== activeBotId) {
        setActiveBotId(found.id);
      }
    }
  };

  // Launch Sovereign Studio Execution via Real Backend Gemini Route (/api/bot)
  const launchPrompt = async (customPrompt?: string, fromVoice?: boolean) => {
    const text = (customPrompt ?? promptInput).trim();
    if (!text || isStreaming) return;

    // Check if user prefixed with a specific @handle
    let selectedBot = activeBot;
    const handleMatch = text.match(/^(@[a-z0-9-]+)\s/i);
    if (handleMatch) {
      const matched = Object.values(bots).find(
        (b) => b.handle.toLowerCase() === handleMatch[1].toLowerCase()
      );
      if (matched) {
        selectedBot = matched;
        setActiveBotId(matched.id);
      }
    }

    if (view === 'frontpage') {
      setView('studio');
      setActiveTab(selectedBot.defaultTab);
    }

    const userMsg: StudioMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      botHandle: selectedBot.handle,
    };

    const assistantId = `a-${Date.now() + 1}`;
    const initialSteps: SovereignStep[] = [
      {
        id: 's1',
        domain: 'CORE',
        label: `Mounted ${selectedBot.handle} (${selectedBot.residency} · Zero-Retention)`,
        status: 'done',
        ms: 14,
      },
      {
        id: 's2',
        domain: 'RAG',
        label: `Querying Vertex RAG [${selectedBot.ragCollections.join(', ') || 'tenant-vault'}]`,
        status: 'running',
      },
    ];

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: assistantId,
        role: 'assistant',
        botHandle: selectedBot.handle,
        content: '',
        steps: initialSteps,
      },
    ]);
    if (!customPrompt) setPromptInput('');
    setIsStreaming(true);
    setAppBatchVerified(false);

    try {
      const tenantId = currentUser?.uid || 'enterprise-demo-vpc';
      const res = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: selectedBot.id,
          customBlueprint: bots[selectedBot.id] && !NIMBUS_BOTS[selectedBot.id] ? selectedBot : undefined,
          tenantId,
          prompt: text,
          history: messages.slice(-8).map((m) => ({
            role: m.role,
            text: m.content,
          })),
          memories: memories.slice(0, 6).map((m) => ({ key: m.key, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Sovereign runtime request failed.');
      }

      if (data.appSpec) {
        setAppSpec(data.appSpec);
      }
      if (Array.isArray(data.browserRows) && data.browserRows.length > 0) {
        setBrowserRows(data.browserRows);
      }
      if (data.browserUrl) {
        setBrowserUrl(data.browserUrl);
        setBrowserUrlDraft(data.browserUrl);
      }
      if (data.desktopStatusLine) {
        setDesktopStatusLine(data.desktopStatusLine);
      }
      if (Array.isArray(data.terminalLines) && data.terminalLines.length > 0) {
        setTerminalLogs((prev) => [...prev, ...data.terminalLines]);
      }
      if (Array.isArray(data.auditRecords) && data.auditRecords.length > 0) {
        setAuditLogs(data.auditRecords);
      }

      const returnedSteps: SovereignStep[] = Array.isArray(data.steps)
        ? data.steps
        : initialSteps.map((s) => ({ ...s, status: 'done' }));

      const replyContent: string =
        data.replyMarkdown ||
        `Completed execution via **${selectedBot.name}** (${selectedBot.handle}).`;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                steps: returnedSteps,
                requiresHitl: Boolean(data.requiresHitl),
                pendingCommand: data.pendingCommand || undefined,
                content: replyContent,
              }
            : m
        )
      );

      // Save high-signal architectural synthesis to Day-1 Memory when requested
      if (text.toLowerCase().includes('remember') || text.toLowerCase().includes('save')) {
        onAddMemory({
          id: `mem-st-${Date.now().toString().slice(-4)}`,
          key: `${selectedBot.handle.replace('@', '')}_note`,
          category: 'episodic',
          content: `${selectedBot.handle}: ${text}`,
          relevanceScore: 0.98,
          lastAccessed: 'Just now',
          tags: ['Sovereign-Studio', selectedBot.handle],
          dayOneLineage: true,
        });
      }

      if ((webSpeech.autoSpeak || webSpeech.handsFree || fromVoice) && replyContent) {
        webSpeech.speak(replyContent, assistantId);
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                steps: initialSteps.map((s) => ({ ...s, status: 'done' })),
                content: `Execution warning: ${err.message || 'Unable to reach Sovereign Core.'}`,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    launchPromptRef.current = launchPrompt;
  });

  // Resolve Human-in-the-Loop (HITL) Governance Gate
  const resolveHitl = async (msgId: string, decision: 'approved' | 'rejected') => {
    const targetMsg = messages.find((m) => m.id === msgId);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              hitlResolved: decision,
              steps: m.steps?.map((s) =>
                s.status === 'hitl_wait' ? { ...s, status: 'done' } : s
              ),
              content:
                decision === 'approved'
                  ? `${m.content}\n\n**HITL Gate Approved:** Mutation executed cleanly inside VPC enclave and anchored to the SHA-256 Audit Ledger.`
                  : `${m.content}\n\n**HITL Gate Aborted:** Mutation rolled back safely; zero external state modified.`,
            }
          : m
      )
    );

    try {
      const res = await fetch('/api/bot/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botHandle: activeBot.handle,
          decision,
          command: targetMsg?.pendingCommand || 'sovereign_mutation',
          tenantId: currentUser?.uid || 'enterprise-demo-vpc',
        }),
      });
      const data = await res.json();
      if (Array.isArray(data?.auditRecords)) {
        setAuditLogs(data.auditRecords);
      }
      if (data?.terminalLine) {
        setTerminalLogs((prev) => [...prev, data.terminalLine]);
      }
    } catch {}
  };

  // Interactive Terminal Command Runner (/api/bot/shell)
  const handleRunTerminal = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalCmd.trim();
    if (!cmd) return;
    setTerminalCmd('');

    if (cmd === 'clear') {
      setTerminalLogs([]);
      return;
    }

    setTerminalLogs((prev) => [...prev, `nimbus-os@firecracker-vm-09:~$ ${cmd}`]);

    try {
      const res = await fetch('/api/bot/shell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          botId: activeBot.id,
          tenantId: currentUser?.uid || 'enterprise-demo-vpc',
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.outputLines)) {
        setTerminalLogs((prev) => [...prev, ...data.outputLines]);
        if (Array.isArray(data.auditRecords)) {
          setAuditLogs(data.auditRecords);
        }
      } else {
        setTerminalLogs((prev) => [
          ...prev,
          `[sandbox] ${data.error || 'Command failed inside MicroVM.'}`,
        ]);
      }
    } catch {
      setTerminalLogs((prev) => [...prev, '[sandbox] Offline or unreachable enclave.']);
    }
  };

  // Browser URL Navigation with Allowlist Enforcement
  const handleBrowserNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    const allowlist = activeBot.browserPolicy?.domainAllowlist || [
      '*.sec.gov',
      '*.gov',
      '*.stripe.com',
      '*.internal.corp',
      '*.ncaa.org',
    ];
    if (!isDomainAllowed(browserUrlDraft, allowlist)) {
      setBrowserDomainNotice(
        `Blocked by Zero-Trust Browser Policy. Allowed patterns: ${allowlist.join(', ')}`
      );
      return;
    }
    setBrowserDomainNotice(null);
    const normalized = browserUrlDraft.startsWith('http')
      ? browserUrlDraft
      : `https://${browserUrlDraft}`;
    setBrowserUrl(normalized);
    setTerminalLogs((prev) => [
      ...prev,
      `[browser-agent] Navigated allowlisted Chromium session -> ${normalized}`,
    ]);
  };

  // Interactive VNC Desktop Click Capture
  const handleDesktopCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!desktopControlUser) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1920);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1080);
    setDesktopCursor({ x, y });
    setTerminalLogs((prev) => [
      ...prev,
      `[x11-operator-override] Dispatched manual left_click(${x}, ${y}) inside 1920x1080 Firecracker desktop`,
    ]);
  };

  // Create New Vertical Cartridge in Agentic Foundry
  const handleCreateCartridge = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId =
      newBotDraft.handle.replace(/[^a-z0-9-]/gi, '').toLowerCase() || `bot-${Date.now()}`;
    const formattedHandle = newBotDraft.handle.startsWith('@')
      ? newBotDraft.handle
      : `@${newBotDraft.handle}`;

    const created: NimbusBotBlueprint = {
      id: cleanId,
      handle: formattedHandle,
      name: newBotDraft.name.trim() || 'Custom Sovereign Bot',
      tagline: newBotDraft.tagline.trim() || 'Custom Enterprise Vertical Cartridge',
      vertical: 'custom',
      defaultTab: newBotDraft.defaultTab,
      primaryModel: 'gemini-4-hydrogen',
      temperature: 0.1,
      maxReasoningSteps: 15,
      residency: newBotDraft.residency,
      zeroRetention: true,
      requireHumanApprovalForMutations: true,
      allowedMcpTools: ['terminal_exec', 'computer_gui_action', 'vault_rag_search'],
      ragCollections: [`${cleanId}-knowledge-vault`],
      a2aPeers: ['@architect', '@iq-computer'],
      systemPrompt: newBotDraft.systemPrompt,
      starterPrompts: [
        `Run full ${newBotDraft.name} diagnostic audit and verify outputs in terminal`,
        `Synthesize executive compliance report using ${formattedHandle}`,
      ],
    };

    setBots((prev) => {
      const updated = { ...prev, [cleanId]: created };
      try {
        const customOnly: Record<string, NimbusBotBlueprint> = {};
        Object.entries(updated).forEach(([k, v]) => {
          if (!NIMBUS_BOTS[k]) customOnly[k] = v;
        });
        localStorage.setItem(CUSTOM_BOTS_STORAGE_KEY, JSON.stringify(customOnly));
      } catch {}
      return updated;
    });

    setActiveBotId(cleanId);
    setShowFoundryModal(false);
    setView('studio');
    setActiveTab(created.defaultTab);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const aaasCurlSnippet = `curl -X POST ${
    typeof window !== 'undefined' ? window.location.origin : 'https://api.nimbusiq.ai'
  }/api/bot \\
  -H "Content-Type: application/json" \\
  -d '{
    "botId": "${activeBot.id}",
    "tenantId": "${currentUser?.uid || 'enterprise-prod-vpc'}",
    "prompt": "Execute autonomous audit and return SHA-256 receipt"
  }'`;

  return (
    <div className="min-h-dvh bg-[#06080F] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* =====================================================================
          VIEW 1: UNIFIED MARKETING FRONTPAGE + PROMPT OMNIBOX
      ===================================================================== */}
      {view === 'frontpage' && (
        <div className="relative overflow-hidden">
          {/* Subtle Architectural Glow */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[480px] w-[860px] rounded-full bg-cyan-500/[0.08] blur-[140px]" />

          {/* Sticky Navigation */}
          <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#06080F]/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 font-black tracking-tighter text-sm">
                  NiQ
                </div>
                <div>
                  <span className="text-base font-bold tracking-tight text-white">Nimbus iQ AI</span>
                  <span className="ml-2.5 hidden sm:inline text-xs font-mono text-slate-400">
                    Sovereign OS v4.2
                  </span>
                </div>
              </div>

              <nav className="hidden lg:flex items-center gap-7 text-sm text-slate-400">
                <a href="#planes" className="hover:text-white transition">
                  Execution Planes
                </a>
                <a href="#foundry" className="hover:text-white transition">
                  Foundry
                </a>
                <a href="#fde" className="hover:text-white transition">
                  FDE Engine
                </a>
                <a href="#aaas" className="hover:text-white transition">
                  AaaS Cloud
                </a>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSwitchToConversational}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition flex items-center gap-1.5 cursor-pointer"
                  title="Switch to Minimal Conversational Mode"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Conversational</span>
                </button>
                <button
                  onClick={() => setShowFoundryModal(true)}
                  className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400/50 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Build @Vertical</span>
                </button>
                <button
                  onClick={() => {
                    setView('studio');
                    setActiveTab(activeBot.defaultTab);
                  }}
                  className="rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition cursor-pointer"
                >
                  Open Studio
                </button>
              </div>
            </div>
          </header>

          {/* Hero + Sovereign Omnibox */}
          <section className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-14 pb-20 text-center">
            <p className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-cyan-300">
              ADK · MCP · A2A · Vertex RAG · Browser &amp; Linux Computer Use
            </p>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.07]">
              One Sovereign Core.{' '}
              <span className="text-cyan-300">Infinite Enterprise Verticals.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
              Prompt full-stack apps, orchestrate headless browsers, operate Linux desktops, and
              deploy multi-agent verticals inside VPC-isolated Firecracker sandboxes.
            </p>

            {/* UNIFIED SOVEREIGN OMNIBOX */}
            <div className="mt-10 rounded-2xl border border-white/12 bg-[#0B101D]/95 p-3 shadow-2xl backdrop-blur-xl text-left">
              {/* Cartridge Selector Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5 mb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {Object.values(bots).map((bot) => {
                    const selected = bot.id === activeBotId;
                    return (
                      <button
                        key={bot.id}
                        onClick={() => setActiveBotId(bot.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
                          selected
                            ? 'bg-cyan-400 text-slate-950 font-bold'
                            : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.09]'
                        }`}
                      >
                        <span>{bot.handle}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setShowFoundryModal(true)}
                    className="rounded-lg border border-dashed border-white/20 px-2.5 py-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 transition cursor-pointer"
                  >
                    + Custom Bot
                  </button>
                </div>

                {/* Unboxed Clean Governance Metadata */}
                <div className="text-[11px] font-mono text-slate-400">
                  {activeBot.residency} · Zero-Retention · {activeBot.allowedMcpTools.length} MCP
                  Tools
                </div>
              </div>

              {/* Live Web Speech Interim Transcript Notice */}
              {(webSpeech.isListening || webSpeech.interimTranscript || webSpeech.voiceError) && (
                <div className="mb-2 rounded-lg bg-slate-950/90 border border-cyan-500/30 px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-cyan-200 truncate">
                    {webSpeech.voiceError
                      ? webSpeech.voiceError
                      : webSpeech.interimTranscript
                        ? `Listening: "${webSpeech.interimTranscript}"`
                        : webSpeech.handsFree
                          ? 'Hands-Free active — speak your mission prompt...'
                          : 'Dictating via Web Speech API...'}
                  </span>
                  <button
                    type="button"
                    onClick={webSpeech.stopListening}
                    className="text-slate-400 hover:text-white ml-3 cursor-pointer"
                  >
                    Stop
                  </button>
                </div>
              )}

              {/* Textarea */}
              <textarea
                rows={3}
                value={promptInput}
                onChange={(e) => handlePromptChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    launchPrompt();
                  }
                }}
                placeholder={`Task ${activeBot.handle} (${activeBot.name}) — or type @iq-computer, @web-operator, @quant, @ops-flow...`}
                className="w-full resize-none bg-transparent px-2 py-1 text-base text-white placeholder-slate-500 focus:outline-none leading-relaxed"
              />

              {/* Omnibox Action Footer */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>RAG: {activeBot.ragCollections[0] || 'tenant-vault'}</span>
                  {activeBot.a2aPeers.length > 0 && (
                    <span>· A2A: {activeBot.a2aPeers.join(', ')}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Web Speech Dictation & Hands-Free Controls */}
                  {webSpeech.isRecognitionSupported && (
                    <>
                      <button
                        type="button"
                        onClick={webSpeech.toggleDictation}
                        className={`rounded-lg border px-2.5 py-2 text-xs transition flex items-center gap-1.5 cursor-pointer ${
                          webSpeech.isListening && !webSpeech.handsFree
                            ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
                            : 'border-white/10 bg-white/[0.03] text-slate-300 hover:text-white'
                        }`}
                        title="Dictate prompt with Web Speech API"
                      >
                        {webSpeech.isListening && !webSpeech.handsFree ? (
                          <MicOff className="w-3.5 h-3.5" />
                        ) : (
                          <Mic className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Dictate</span>
                      </button>

                      <button
                        type="button"
                        onClick={webSpeech.toggleHandsFree}
                        className={`rounded-lg border px-2.5 py-2 text-xs transition flex items-center gap-1.5 cursor-pointer ${
                          webSpeech.handsFree
                            ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                            : 'border-white/10 bg-white/[0.03] text-slate-300 hover:text-white'
                        }`}
                        title="Hands-Free Voice Mode (Continuous SpeechRecognition + SpeechSynthesis)"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {webSpeech.handsFree ? 'Hands-Free On' : 'Hands-Free'}
                        </span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => launchPrompt()}
                    disabled={!promptInput.trim() || isStreaming}
                    className="rounded-xl bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-40 transition cursor-pointer"
                  >
                    Launch Sovereign Studio
                  </button>
                </div>
              </div>
            </div>

            {/* Active Bot Starter Prompts */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {activeBot.starterPrompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => launchPrompt(sp)}
                  className="rounded-lg border border-white/10 bg-white/[0.025] px-3.5 py-2 text-xs text-slate-300 hover:border-cyan-400/40 hover:text-white transition text-left cursor-pointer"
                >
                  {sp}
                </button>
              ))}
            </div>
          </section>

          {/* 4 Execution Planes Strip */}
          <section id="planes" className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  code: '01 · ORCHESTRATION',
                  title: 'ADK + MCP + A2A Mesh',
                  desc: 'Hierarchical Google ADK orchestrators delegating across specialized vertical peer agents via typed JSON-RPC.',
                },
                {
                  code: '02 · KNOWLEDGE',
                  title: 'Vertex RAG Engine',
                  desc: 'Tenant-partitioned hybrid dense + BM25 vector retrieval with mandatory citation grounding.',
                },
                {
                  code: '03 · WEB OPERATOR',
                  title: 'Headless Browser Agent',
                  desc: 'Ephemeral Chromium with Set-of-Mark visual DOM grounding, domain allowlists, and opaque Vault auth.',
                },
                {
                  code: '04 · DESKTOP & SHELL',
                  title: 'Computer & Terminal VM',
                  desc: '1920×1080 Linux X11 desktop and sandboxed CLI inside sub-150ms Firecracker MicroVMs.',
                },
              ].map((plane, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#0B101D]/70 p-5 hover:border-white/20 transition"
                >
                  <div className="text-[11px] font-mono text-cyan-400 tracking-wider">
                    {plane.code}
                  </div>
                  <h3 className="mt-2 font-bold text-white text-base">{plane.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{plane.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3 Enterprise Architecture Pillars */}
          <section className="border-t border-white/[0.08] bg-[#080C17] py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Three Pillars. Zero Core Rewrites.
                </h2>
                <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                  Every new business vertical is a declarative{' '}
                  <code className="text-cyan-300 font-mono">NimbusBotBlueprint</code> cartridge
                  mounted onto the same hardened runtime.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div
                  id="foundry"
                  className="rounded-2xl border border-white/10 bg-[#0B101D] p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono text-cyan-400 mb-2">
                      01 · AGENTIC FOUNDRY FACTORY
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Mint Specialized Verticals in Minutes
                    </h3>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                      Bind system instructions, MCP toolkits, Vertex RAG corpora, and zero-retention
                      VPC policies into hot-swappable <code className="font-mono">@bot</code>{' '}
                      cartridges without touching orchestration infrastructure.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFoundryModal(true)}
                    className="mt-6 w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20 transition cursor-pointer"
                  >
                    Launch Foundry Cartridge Builder
                  </button>
                </div>

                <div
                  id="fde"
                  className="rounded-2xl border border-white/10 bg-[#0B101D] p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono text-emerald-400 mb-2">
                      02 · FORWARD-DEPLOYED ENGINEER (FDE)
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Autonomous Enterprise Integration
                    </h3>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                      <code className="font-mono">@architect</code> and{' '}
                      <code className="font-mono">@iq-computer</code> ingest legacy OpenAPI specs,
                      ERP schemas, and internal runbooks to generate and regression-test custom MCP
                      adapters automatically.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      launchPrompt(
                        '@architect Scaffold a custom MCP connector and regression suite for our internal PostgreSQL & SAP ERP APIs'
                      )
                    }
                    className="mt-6 w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20 transition cursor-pointer"
                  >
                    Test Autonomous FDE Workflow
                  </button>
                </div>

                <div
                  id="aaas"
                  className="rounded-2xl border border-white/10 bg-[#0B101D] p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono text-indigo-400 mb-2">
                      03 · AGENT-AS-A-SERVICE (AaaS)
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Instant Multi-Tenant API &amp; SLA Metering
                    </h3>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                      Publish any Studio agent directly to a tenant-scoped REST/SSE endpoint with
                      cryptographic SHA-256 audit receipts, HITL webhooks, and 75% cached token
                      economics.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setView('studio');
                      setShowDeployModal(true);
                    }}
                    className="mt-6 w-full rounded-xl border border-indigo-400/30 bg-indigo-400/10 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-400/20 transition cursor-pointer"
                  >
                    Inspect AaaS Endpoint Spec
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: SPLIT-SCREEN SOVEREIGN WORKSPACE STUDIO
      ===================================================================== */}
      {view === 'studio' && (
        <div className="flex h-dvh flex-col bg-[#05070E]">
          {/* Studio Top Bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#090D18] px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('frontpage')}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                ← Frontpage
              </button>

              <span className="text-white/15">|</span>

              <select
                value={activeBotId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setActiveBotId(nextId);
                  if (bots[nextId]) setActiveTab(bots[nextId].defaultTab);
                }}
                className="rounded-lg border border-white/15 bg-[#0F1629] px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer"
              >
                {Object.values(bots).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.handle} — {b.name}
                  </option>
                ))}
              </select>

              <span className="hidden xl:inline text-xs font-mono text-slate-400">
                {activeBot.residency} · Zero-Retention · Firecracker Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Hands-Free Web Speech Toggle in Studio */}
              {webSpeech.isRecognitionSupported && (
                <button
                  onClick={webSpeech.toggleHandsFree}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    webSpeech.handsFree
                      ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:text-white'
                  }`}
                  title="Hands-Free Web Speech Input & SpeechSynthesis"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {webSpeech.handsFree ? 'Hands-Free On' : 'Hands-Free'}
                  </span>
                </button>
              )}

              {/* SpeechSynthesis Auto-Speak Toggle */}
              <button
                onClick={() => {
                  if (webSpeech.isSpeaking) webSpeech.stopSpeaking();
                  webSpeech.setAutoSpeak(!webSpeech.autoSpeak);
                }}
                className={`rounded-lg border p-1.5 transition cursor-pointer ${
                  webSpeech.autoSpeak
                    ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                }`}
                title={webSpeech.autoSpeak ? 'Auto-Speak ON' : 'Auto-Speak OFF'}
              >
                {webSpeech.autoSpeak ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={onSwitchToConversational}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                title="Switch to Pure Conversational Mode"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Conversational</span>
              </button>

              <button
                onClick={() => setShowFoundryModal(true)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400/50 transition cursor-pointer"
              >
                + Foundry
              </button>

              <button
                onClick={() => setShowDeployModal(true)}
                className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition cursor-pointer"
              >
                Deploy AaaS
              </button>

              {currentUser ? (
                <button
                  onClick={onSignOut}
                  className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                  title={`Signed in as ${currentUser.email} — Click to sign out`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onSignIn}
                  className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
                  title="Sign in with Google to sync Day-1 Memory"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Sign In</span>
                </button>
              )}
            </div>
          </header>

          {/* Split Panes */}
          <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
            {/* LEFT PANE (40%): Reasoning Stream, HITL Governance & Voice/Text Composer */}
            <div className="flex w-full lg:w-[40%] lg:min-w-[360px] flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-[#080B14] max-h-[48dvh] lg:max-h-none">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-xs text-slate-400 space-y-3">
                    <div className="font-semibold text-white text-sm">
                      {activeBot.name} ({activeBot.handle}) Ready
                    </div>
                    <p className="leading-relaxed">{activeBot.tagline}</p>
                    <div className="font-mono text-[11px] text-slate-500">
                      MCP Tools: {activeBot.allowedMcpTools.join(', ')}
                    </div>
                    <div className="pt-2 space-y-1.5">
                      {activeBot.starterPrompts.map((sp, idx) => (
                        <button
                          key={idx}
                          onClick={() => launchPrompt(sp)}
                          className="w-full text-left rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-300 hover:border-cyan-400/40 hover:text-white transition cursor-pointer"
                        >
                          {sp}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl p-3.5 text-sm ${
                      m.role === 'user'
                        ? 'bg-cyan-500/10 border border-cyan-400/25 text-cyan-50 ml-6'
                        : 'bg-white/[0.03] border border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>
                        {m.role === 'user' ? 'OPERATOR' : `NIMBUS CORE · ${m.botHandle}`}
                      </span>
                    </div>

                    {/* Multi-Plane Execution Trace */}
                    {m.steps && (
                      <div className="mb-3 space-y-1.5 rounded-lg bg-black/40 p-2.5 border border-white/[0.06]">
                        {m.steps.map((st) => (
                          <div key={st.id} className="flex items-center gap-2 text-xs font-mono">
                            <span
                              className={`text-[10px] w-16 shrink-0 font-semibold ${
                                st.status === 'done'
                                  ? 'text-emerald-400'
                                  : st.status === 'hitl_wait'
                                    ? 'text-amber-300'
                                    : 'text-cyan-300'
                              }`}
                            >
                              [{st.domain}]
                            </span>
                            <span className="text-slate-300 truncate flex-1">{st.label}</span>
                            <span className="text-slate-500 text-[10px] tabular-nums shrink-0">
                              {st.status === 'done'
                                ? st.ms
                                  ? `${st.ms}ms`
                                  : 'OK'
                                : st.status === 'hitl_wait'
                                  ? 'GATE'
                                  : '...'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Body */}
                    {m.content ? (
                      <div className="whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed text-slate-200">
                        {m.content}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing sovereign execution plan...</span>
                      </div>
                    )}

                    {/* Assistant Actions: Web Speech Synthesis Listen + Copy */}
                    {m.role === 'assistant' && m.content && (
                      <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center gap-3 text-[11px]">
                        {webSpeech.isSynthesisSupported && (
                          <button
                            onClick={() => webSpeech.speak(m.content, m.id)}
                            className={`flex items-center gap-1 transition cursor-pointer ${
                              webSpeech.speakingMessageId === m.id
                                ? 'text-cyan-300'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>
                              {webSpeech.speakingMessageId === m.id ? 'Stop Speaking' : 'Listen'}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyText(m.id, m.content)}
                          className="flex items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          {copiedId === m.id ? (
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
                    )}

                    {/* HITL Sovereign Governance Approval Gate */}
                    {m.requiresHitl && !m.hitlResolved && m.content && (
                      <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3">
                        <div className="text-xs font-bold text-amber-300">
                          HUMAN-IN-THE-LOOP (HITL) GOVERNANCE GATE
                        </div>
                        <p className="mt-1 text-[11px] text-amber-100/85 font-mono break-all">
                          {m.pendingCommand ||
                            `${m.botHandle} staged an external state mutation requiring dual-key sign-off.`}
                        </p>
                        <div className="mt-2.5 flex gap-2">
                          <button
                            onClick={() => resolveHitl(m.id, 'approved')}
                            className="rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-300 transition cursor-pointer"
                          >
                            Approve &amp; Commit
                          </button>
                          <button
                            onClick={() => resolveHitl(m.id, 'rejected')}
                            className="rounded-md border border-rose-400/40 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/30 transition cursor-pointer"
                          >
                            Abort Mutation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Studio Chat + Web Speech Composer */}
              <div className="border-t border-white/10 p-3 bg-[#090D18] space-y-2">
                {(webSpeech.isListening || webSpeech.interimTranscript) && (
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/30 flex items-center justify-between text-[11px]">
                    <span className="text-cyan-300 truncate">
                      {webSpeech.interimTranscript
                        ? `"${webSpeech.interimTranscript}"`
                        : 'Listening via Web Speech API...'}
                    </span>
                    <button
                      type="button"
                      onClick={webSpeech.stopListening}
                      className="text-slate-400 hover:text-white ml-2 cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                )}

                <div className="flex gap-1.5">
                  <input
                    value={promptInput}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && launchPrompt()}
                    placeholder={`Instruct ${activeBot.handle} or switch @bot...`}
                    className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  {webSpeech.isRecognitionSupported && (
                    <button
                      type="button"
                      onClick={webSpeech.toggleDictation}
                      className={`rounded-lg border px-2.5 py-2 transition cursor-pointer ${
                        webSpeech.isListening
                          ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-300'
                          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:text-white'
                      }`}
                      title="Voice Input (Web Speech API)"
                    >
                      {webSpeech.isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => launchPrompt()}
                    disabled={isStreaming || !promptInput.trim()}
                    className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-40 transition cursor-pointer"
                  >
                    Run
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANE (60%): 5-Tab Multi-Plane Sovereign Viewport */}
            <div className="flex flex-1 flex-col bg-[#05070E] min-h-0">
              {/* 5 Viewport Tabs */}
              <div className="flex items-center justify-between border-b border-white/10 bg-[#0A0F1D] px-3 py-2 overflow-x-auto">
                <div className="flex gap-1">
                  {(
                    [
                      { id: 'preview', label: 'Live App & Flow', icon: Code2 },
                      { id: 'browser', label: 'Browser Agent', icon: Globe },
                      { id: 'desktop', label: 'Computer VNC', icon: Monitor },
                      { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
                      { id: 'audit', label: 'Audit Ledger', icon: ShieldCheck },
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          activeTab === t.id
                            ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/35'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {activeTab === 'preview' && (
                  <div className="flex rounded-lg border border-white/10 bg-black/40 p-0.5 text-[11px] shrink-0 ml-2">
                    {(['ui', 'architecture', 'code'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPreviewMode(mode)}
                        className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                          previewMode === mode
                            ? 'bg-white/15 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode === 'ui'
                          ? 'Live App'
                          : mode === 'architecture'
                            ? 'A2A + MCP Graph'
                            : 'ADK Code'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Viewport Body */}
              <div className="flex-1 overflow-auto p-5">
                {/* TAB 1: LIVE APP, A2A GRAPH & ADK CODE */}
                {activeTab === 'preview' && (
                  <>
                    {previewMode === 'ui' && (
                      <div className="rounded-2xl border border-white/10 bg-[#0B101E] p-6 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                          <div>
                            <div className="text-xs font-mono text-cyan-400">
                              LIVE SOVEREIGN ARTIFACT · {activeBot.handle.toUpperCase()}
                            </div>
                            <h3 className="text-lg font-bold text-white mt-0.5">
                              {appSpec.appTitle}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">{appSpec.subtitle}</p>
                          </div>
                          <button
                            onClick={() => setAppBatchVerified(true)}
                            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                              appBatchVerified
                                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                                : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold'
                            }`}
                          >
                            <span>
                              {appBatchVerified
                                ? 'Batch Anchored to Ledger'
                                : appSpec.primaryActionLabel}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {appSpec.metrics.map((kpi, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-white/[0.08] bg-black/35 p-4"
                            >
                              <div className="text-xs text-slate-400">{kpi.label}</div>
                              <div className="mt-1 text-xl font-bold text-white font-mono tabular-nums">
                                {kpi.value}
                              </div>
                              <div className="mt-1 text-[11px] text-cyan-300 font-mono">
                                {kpi.delta}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Synthesized Telemetry Rows */}
                        <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-white/[0.04] text-slate-400">
                              <tr>
                                <th className="p-3">Entity / Pipeline</th>
                                <th className="p-3">Execution Stage</th>
                                <th className="p-3">Metric</th>
                                <th className="p-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.06]">
                              {appSpec.rows.map((r, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02]">
                                  <td className="p-3 text-white">{r.entity}</td>
                                  <td className="p-3 text-slate-300">{r.stage}</td>
                                  <td className="p-3 text-cyan-300 tabular-nums">{r.metric}</td>
                                  <td className="p-3 text-emerald-400">{r.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {previewMode === 'architecture' && (
                      <div className="rounded-2xl border border-white/10 bg-[#0B101E] p-6 space-y-6">
                        <div className="text-xs font-mono text-cyan-400">
                          GOOGLE ADK + A2A PEER TOPOLOGY + MCP BINDINGS
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center font-mono text-xs">
                          <div className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-4">
                            <div className="font-bold text-white">{activeBot.handle}</div>
                            <div className="text-[11px] text-cyan-200 mt-1">
                              Primary Orchestrator ({activeBot.primaryModel})
                            </div>
                          </div>
                          <div className="text-slate-400 text-xs">
                            ─── JSON-RPC / A2A Mesh ───►
                          </div>
                          <div className="space-y-2">
                            {(activeBot.a2aPeers.length > 0
                              ? activeBot.a2aPeers
                              : ['@iq-computer', '@web-operator']
                            ).map((peer) => (
                              <div
                                key={peer}
                                className="rounded-lg border border-indigo-400/35 bg-indigo-500/10 p-2.5 text-indigo-200"
                              >
                                Peer Agent: {peer}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs font-mono">
                          <div className="rounded-xl bg-black/40 p-4 border border-white/[0.06]">
                            <div className="text-slate-400 mb-2">MOUNTED MCP SERVERS</div>
                            <div className="flex flex-wrap gap-1.5">
                              {activeBot.allowedMcpTools.map((tool) => (
                                <span
                                  key={tool}
                                  className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-cyan-300"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-xl bg-black/40 p-4 border border-white/[0.06]">
                            <div className="text-slate-400 mb-2">VERTEX RAG COLLECTIONS</div>
                            <div className="flex flex-wrap gap-1.5">
                              {activeBot.ragCollections.map((col) => (
                                <span
                                  key={col}
                                  className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-emerald-300"
                                >
                                  {col}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewMode === 'code' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-400">
                            Synthesized TypeScript / Google ADK Module
                          </span>
                          <button
                            onClick={() => handleCopyText('adk-code', appSpec.adkCode)}
                            className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === 'adk-code' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Module</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="rounded-2xl border border-white/10 bg-[#090D16] p-5 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                          {appSpec.adkCode}
                        </pre>
                      </div>
                    )}
                  </>
                )}

                {/* TAB 2: ISOLATED HEADLESS BROWSER AGENT */}
                {activeTab === 'browser' && (
                  <div className="rounded-2xl border border-white/10 bg-[#0B101E] overflow-hidden">
                    <form
                      onSubmit={handleBrowserNavigate}
                      className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#11182B] px-4 py-2.5"
                    >
                      <input
                        value={browserUrlDraft}
                        onChange={(e) => setBrowserUrlDraft(e.target.value)}
                        className="flex-1 min-w-[220px] rounded-md bg-black/50 border border-white/10 px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-mono text-white transition cursor-pointer"
                      >
                        Navigate
                      </button>
                      <span className="text-[11px] font-mono text-emerald-400">
                        Vault Auth · SoM Overlay Active
                      </span>
                    </form>

                    {browserDomainNotice && (
                      <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 text-xs text-rose-200 font-mono">
                        {browserDomainNotice}
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            Active Session: {browserUrl}
                          </h4>
                          <p className="text-xs text-slate-400">
                            Visual Set-of-Mark (SoM) Grounding · Ephemeral Chromium Container
                          </p>
                        </div>
                        <span className="rounded border border-cyan-400/50 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-mono text-cyan-300">
                          SoM #14: Export CSV
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 overflow-hidden">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-white/[0.04] text-slate-400">
                            <tr>
                              <th className="p-3">Vendor / Entity</th>
                              <th className="p-3">SKU / Filing</th>
                              <th className="p-3">Scope</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3">SoM State</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.06]">
                            {browserRows.map((row, idx) => (
                              <tr
                                key={idx}
                                className={idx === 0 ? 'bg-cyan-500/[0.05]' : undefined}
                              >
                                <td className="p-3 text-white">{row.vendor}</td>
                                <td className="p-3 text-slate-300">{row.sku}</td>
                                <td className="p-3 text-slate-300">{row.qty}</td>
                                <td className="p-3 text-amber-300 tabular-nums">{row.total}</td>
                                <td className="p-3 text-cyan-300">
                                  [SoM #{18 + idx * 3}] {row.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: COMPUTER AGENT (1920x1080 UBUNTU VNC DESKTOP) */}
                {activeTab === 'desktop' && (
                  <div className="rounded-2xl border border-white/10 bg-[#0A0E1A] overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#11182B] px-4 py-2.5 text-xs">
                      <div className="font-mono text-slate-300">
                        Firecracker MicroVM · Ubuntu 24.04 X11 (1920×1080) · Cursor ({desktopCursor.x},{' '}
                        {desktopCursor.y})
                      </div>
                      <button
                        onClick={() => setDesktopControlUser(!desktopControlUser)}
                        className={`rounded-md px-3 py-1 font-semibold transition cursor-pointer ${
                          desktopControlUser
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {desktopControlUser
                          ? 'Release Control to @iq-computer'
                          : 'Take Manual Control'}
                      </button>
                    </div>

                    <div
                      onClick={handleDesktopCanvasClick}
                      className={`p-6 bg-gradient-to-br from-[#0F172A] via-[#0B1324] to-[#090D16] min-h-[390px] relative grid grid-cols-1 md:grid-cols-2 gap-4 ${
                        desktopControlUser ? 'cursor-crosshair ring-1 ring-amber-400/50' : ''
                      }`}
                    >
                      {/* Window 1: Legacy Desktop App */}
                      <div className="rounded-xl border border-white/15 bg-[#090D16]/95 shadow-xl p-4 font-mono text-xs">
                        <div className="border-b border-white/10 pb-2 mb-3 text-slate-400 flex justify-between">
                          <span>SAP_GUI_Legacy_Ledger_v4.bin</span>
                          <span className="text-cyan-400">PID 4412</span>
                        </div>
                        <div className="space-y-2 text-slate-300">
                          <div>Loaded Mount: /workspace/tenant_vault/Q3_Ledger.xlsx</div>
                          <div className="text-emerald-400">✓ 14,820 General Ledger Rows Parsed</div>
                          <div className="text-amber-300">
                            ! Flagged Variance on Cost-Center #409 ($14,210.00)
                          </div>
                          <div className="rounded bg-white/[0.04] p-2.5 mt-3 text-[11px] text-slate-400">
                            {desktopControlUser
                              ? 'Operator Manual Override Active — Click anywhere on the X11 desktop to dispatch GUI coordinates.'
                              : '@iq-computer Action: Extracting variance rows -> /workspace/tenant_vault/variance_audit.csv'}
                          </div>
                        </div>
                      </div>

                      {/* Window 2: Sovereign Python Reconciliation Runner */}
                      <div className="rounded-xl border border-cyan-400/30 bg-black/85 shadow-xl p-4 font-mono text-xs text-emerald-300">
                        <div className="border-b border-white/10 pb-2 mb-3 text-slate-400">
                          python3 reconcile_erp.py --strict
                        </div>
                        <p>&gt; Computing SHA-256 checksum on Q3_Ledger.xlsx...</p>
                        <p>&gt; Cross-checking against @web-operator PO export...</p>
                        <p className="text-cyan-300 mt-2">&gt; {desktopStatusLine}</p>
                        <p className="text-slate-400 mt-2">
                          &gt; Artifact bridged to Vertex RAG Vault (Zero-Retention).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: SANDBOXED INTERACTIVE CO-PILOT TERMINAL */}
                {activeTab === 'terminal' && (
                  <div className="flex h-[430px] flex-col rounded-2xl border border-white/10 bg-[#05070C] font-mono text-xs overflow-hidden">
                    <div className="border-b border-white/10 bg-[#0D1322] px-4 py-2 text-slate-400 flex justify-between">
                      <span>bash — firecracker-microvm (rootless · outbound-restricted)</span>
                      <span className="text-emerald-400">TTY READY</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-slate-200">
                      {terminalLogs.map((line, i) => (
                        <div
                          key={i}
                          className={
                            line.includes('~$') ? 'text-cyan-300 font-semibold' : 'text-slate-300'
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                    <form
                      onSubmit={handleRunTerminal}
                      className="flex border-t border-white/10 bg-black/60 px-3 py-2.5 items-center"
                    >
                      <span className="text-cyan-400 mr-2 shrink-0">nimbus-os:~$</span>
                      <input
                        value={terminalCmd}
                        onChange={(e) => setTerminalCmd(e.target.value)}
                        placeholder="Try: help, whoami, mcp list, a2a peers, rag stats, catalog verify, clear"
                        className="flex-1 bg-transparent text-white focus:outline-none"
                      />
                    </form>
                  </div>
                )}

                {/* TAB 5: CRYPTOGRAPHIC SHA-256 AUDIT LEDGER */}
                {activeTab === 'audit' && (
                  <div className="rounded-2xl border border-white/10 bg-[#0B101E] overflow-hidden">
                    <div className="border-b border-white/10 px-5 py-3.5 flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Immutable Sovereign Audit Ledger
                        </h4>
                        <p className="text-xs text-slate-400">
                          Hash-chained execution receipts across ADK, RAG, Browser, Desktop &amp;
                          Terminal planes
                        </p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400">
                        SOC2 · HIPAA · ISO-42001 VERIFIED
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-white/[0.04] text-slate-400">
                          <tr>
                            <th className="p-3.5">Timestamp</th>
                            <th className="p-3.5">Plane</th>
                            <th className="p-3.5">Action</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">SHA-256 Chain</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.02]">
                              <td className="p-3.5 text-slate-400 tabular-nums">{log.ts}</td>
                              <td className="p-3.5 text-cyan-300">{log.plane}</td>
                              <td className="p-3.5 text-slate-200">{log.action}</td>
                              <td className="p-3.5">
                                <span
                                  className={
                                    log.status === 'VERIFIED'
                                      ? 'text-emerald-400'
                                      : log.status === 'PENDING_HITL'
                                        ? 'text-amber-300'
                                        : 'text-rose-400'
                                  }
                                >
                                  {log.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-slate-500 tabular-nums">{log.hash}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: AGENTIC FOUNDRY FACTORY (MINT NEW @VERTICAL CARTRIDGE)
      ===================================================================== */}
      {showFoundryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCartridge}
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0B101E] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Agentic Foundry — Mint Vertical Cartridge
              </h3>
              <button
                type="button"
                onClick={() => setShowFoundryModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Bot Handle</label>
                <input
                  required
                  value={newBotDraft.handle}
                  onChange={(e) => setNewBotDraft({ ...newBotDraft, handle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Data Residency</label>
                <select
                  value={newBotDraft.residency}
                  onChange={(e) =>
                    setNewBotDraft({
                      ...newBotDraft,
                      residency: e.target.value as DataResidency,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0F1629] px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="vpc-isolated">vpc-isolated</option>
                  <option value="eu-sovereign">eu-sovereign</option>
                  <option value="gcp-us-central1">gcp-us-central1</option>
                  <option value="air-gapped-onprem">air-gapped-onprem</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Vertical Name</label>
                <input
                  required
                  value={newBotDraft.name}
                  onChange={(e) => setNewBotDraft({ ...newBotDraft, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Default Execution Plane</label>
                <select
                  value={newBotDraft.defaultTab}
                  onChange={(e) =>
                    setNewBotDraft({
                      ...newBotDraft,
                      defaultTab: e.target.value as ViewportTab,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0F1629] px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="preview">Live App &amp; Flow</option>
                  <option value="desktop">Computer VNC (1920x1080)</option>
                  <option value="browser">Headless Browser Agent</option>
                  <option value="terminal">Sandboxed Terminal</option>
                  <option value="audit">SHA-256 Audit Ledger</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Tagline</label>
              <input
                value={newBotDraft.tagline}
                onChange={(e) => setNewBotDraft({ ...newBotDraft, tagline: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">
                Sovereign System Directive &amp; Guardrails
              </label>
              <textarea
                rows={3}
                value={newBotDraft.systemPrompt}
                onChange={(e) => setNewBotDraft({ ...newBotDraft, systemPrompt: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-400 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition cursor-pointer"
            >
              Publish &amp; Hot-Mount Cartridge
            </button>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: DEPLOY AGENT-AS-A-SERVICE (AaaS) ENDPOINT
      ===================================================================== */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0B101E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                AaaS Production Endpoint — {activeBot.handle}
              </h3>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Sovereign Cartridge is live on <code className="font-mono">/api/bot</code> with
              tenant isolation, domain allowlists, HITL gates, and SHA-256 audit receipts.
            </p>
            <pre className="rounded-xl bg-black/70 border border-white/10 p-4 text-xs font-mono text-cyan-300 overflow-x-auto">
              {aaasCurlSnippet}
            </pre>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(aaasCurlSnippet);
                  setCopiedCurl(true);
                  setTimeout(() => setCopiedCurl(false), 1800);
                }}
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied cURL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy cURL</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeployModal(false)}
                className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
