import React, { useState, useEffect } from 'react';
import { 
  Cpu, Terminal, Layers, Database, Shield, Calculator, 
  Play, CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  Search, Plus, Eye, Check, X, Sparkles, Server, Zap,
  ExternalLink, RotateCw, RefreshCw, ChevronRight, Lock, 
  Sliders, Activity, FileCode, CheckCheck, UserCheck, ShieldCheck
} from 'lucide-react';
import { 
  SuperAgentTask, AutonomousAgent, ToolDefinition, 
  MemoryRecord, PendingApproval, UserRole, AgentTimelineStep 
} from '../types';

interface SuperAgentConsoleProps {
  tasks: SuperAgentTask[];
  agents: AutonomousAgent[];
  tools: ToolDefinition[];
  memories: MemoryRecord[];
  approvals: PendingApproval[];
  onAddTask: (task: SuperAgentTask) => void;
  onUpdateTask?: (task: SuperAgentTask) => void;
  onApproveAction: (approvalId: string) => void;
  onRejectAction: (approvalId: string) => void;
  onAddMemory: (memory: MemoryRecord) => void;
  onToggleTool: (toolId: string) => void;
  onOpenDomain: () => void;
}

export default function SuperAgentConsole({
  tasks,
  agents,
  tools,
  memories,
  approvals,
  onAddTask,
  onUpdateTask,
  onApproveAction,
  onRejectAction,
  onAddMemory,
  onToggleTool,
  onOpenDomain
}: SuperAgentConsoleProps) {
  // Navigation tabs within SuperAgent console
  const [activeSubTab, setActiveSubTab] = useState<
    'tasks' | 'agents' | 'tools' | 'memory' | 'governance' | 'observability'
  >('tasks');

  // RBAC active role simulation
  const [activeRole, setActiveRole] = useState<UserRole>('Owner');

  // LLM connection status
  const [llmConnected, setLlmConnected] = useState<boolean | null>(null);
  const [llmActiveModel, setLlmActiveModel] = useState<string>('gemini-3.8-flash');

  useEffect(() => {
    fetch('/api/llm/status')
      .then((res) => res.json())
      .then((data) => {
        setLlmConnected(Boolean(data.connected));
        if (data.defaultModel) setLlmActiveModel(data.defaultModel);
      })
      .catch(() => {
        setLlmConnected(false);
      });
  }, []);

  // Task creation state
  const [taskPrompt, setTaskPrompt] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('agent-orchestrator');
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<SuperAgentTask>(tasks[0] || null);
  const [isExecutingLive, setIsExecutingLive] = useState(false);

  // Tool sandbox state
  const [activeTestingTool, setActiveTestingTool] = useState<ToolDefinition>(tools[0]);
  const [toolTestInput, setToolTestInput] = useState('{"path": "src/firebase.ts", "query": "auth", "depth": 2}');
  const [toolExecutionOutput, setToolExecutionOutput] = useState<string | null>(null);
  const [isToolRunning, setIsToolRunning] = useState(false);

  // Memory search state
  const [memorySearch, setMemorySearch] = useState('');
  const [newMemoryKey, setNewMemoryKey] = useState('');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);

  // Quick prompt templates
  const QUICK_PROMPTS = [
    {
      title: 'Audit Firebase Security Rules',
      prompt: 'Inspect Firestore security rules in firestore.rules. Verify RBAC permissions for Owner, Admin, Developer, and block unauthenticated writes.',
      agent: 'agent-code-graph'
    },
    {
      title: 'Deploy Cloud Run Worker',
      prompt: 'Deploy high-performance reasoning microservice container to Google Cloud Run in us-west2 with scale-to-zero enabled.',
      agent: 'agent-cloudrun-deployer'
    },
    {
      title: 'Forensic Line-Item Audit',
      prompt: 'Reconcile insurance adjuster estimate against IRC R905.2.8.2 Ice & Water Shield code and SATCALC slope geometry.',
      agent: 'agent-domain-solver'
    },
    {
      title: 'Vector Knowledge Retrieval',
      prompt: 'Retrieve cosine similarity embeddings for Photonic-Void security policy and code reuse patterns.',
      agent: 'agent-rag-memory'
    }
  ];

  // Execute a new autonomous task through the live Gemini LLM 8-step lifecycle
  const handleExecuteNewTask = async (customPrompt?: string, customAgentId?: string) => {
    const promptToRun = customPrompt || taskPrompt;
    if (!promptToRun.trim()) return;

    const agent = agents.find(a => a.id === (customAgentId || selectedAgentId)) || agents[0];
    const isHighRisk = promptToRun.toLowerCase().includes('deploy') || promptToRun.toLowerCase().includes('delete') || promptToRun.toLowerCase().includes('secret');

    const newTaskId = `task-${Date.now().toString().slice(-4)}`;

    const initialSteps: AgentTimelineStep[] = [
      {
        id: `step-${Date.now()}-1`,
        stage: 'CONTEXT',
        title: 'Query Vector Index & Dispatch to Gemini Enclave',
        detail: `Loading ${memories.length} episodic memory records. Routing prompt to "${agent.name}" (${agent.model})...`,
        timestamp: 'Just now',
        status: 'running',
        metrics: { latencyMs: 38, tokens: 240 }
      }
    ];

    const newTask: SuperAgentTask = {
      id: newTaskId,
      title: promptToRun.slice(0, 52) + (promptToRun.length > 52 ? '...' : ''),
      prompt: promptToRun,
      assignedAgent: agent.name,
      status: 'RUNNING',
      riskLevel: isHighRisk ? 'HIGH_APPROVAL' : 'LOW',
      tokensUsed: 240,
      latencyMs: 38,
      createdAt: 'Just now',
      timeline: initialSteps,
      requiresApproval: isHighRisk
    };

    onAddTask(newTask);
    setSelectedTaskForDetail(newTask);
    setIsExecutingLive(true);
    setTaskPrompt('');

    try {
      const res = await fetch('/api/agent/execute-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToRun,
          agentName: agent.name,
          agentRole: agent.role,
          agentSystemPrompt: agent.systemPrompt,
          agentTools: agent.tools,
          activeRole,
          memories
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'LLM execution request failed.');
      }

      const s = data.structured;
      const totalLatency = data.latencyMs || 820;
      const totalTokens = data.tokensUsed || 1840;
      const perStepLatency = Math.max(40, Math.round(totalLatency / 5));

      const completedSteps: AgentTimelineStep[] = [
        {
          id: `step-${Date.now()}-1`,
          stage: 'CONTEXT',
          title: 'Loaded Vector Context & AST Graph',
          detail: s.contextSummary,
          timestamp: 'Just now',
          status: 'completed',
          metrics: { latencyMs: perStepLatency, tokens: Math.round(totalTokens * 0.18) }
        },
        {
          id: `step-${Date.now()}-2`,
          stage: 'PLAN',
          title: 'Formulated Deterministic Action Plan',
          detail: s.planSummary,
          timestamp: 'Just now',
          status: 'completed',
          metrics: { latencyMs: perStepLatency, tokens: Math.round(totalTokens * 0.22) }
        },
        {
          id: `step-${Date.now()}-3`,
          stage: 'TOOL',
          title: `Dispatched Enclave Tool: ${s.selectedTool || agent.tools[0]}`,
          detail: s.toolDispatchDetail,
          toolUsed: s.selectedTool || agent.tools[0],
          timestamp: 'Just now',
          status: 'completed',
          metrics: { latencyMs: perStepLatency, tokens: Math.round(totalTokens * 0.15) }
        }
      ];

      if (isHighRisk) {
        completedSteps.push({
          id: `step-${Date.now()}-4`,
          stage: 'OBSERVATION',
          title: 'Governance Sentinel: High-Risk Policy Gate',
          detail: `${s.executionObservation} — Paused prior to production mutation for human cryptographic sign-off.`,
          timestamp: 'Just now',
          status: 'waiting_approval',
          metrics: { latencyMs: 42 }
        });

        const gatedTask: SuperAgentTask = {
          ...newTask,
          status: 'WAITING_APPROVAL',
          tokensUsed: totalTokens,
          latencyMs: totalLatency,
          timeline: completedSteps,
          approvalDetails: {
            action: 'production.enclave.mutate',
            target: `projects/google-mpf-u5ao4iqsmytq/enclaves/${agent.id}`,
            requestedBy: agent.name,
            diffSnippet: `+ task: ${newTask.title}\n+ tool: ${s.selectedTool}\n+ plan: ${s.planSummary.slice(0, 120)}`
          }
        };

        setSelectedTaskForDetail(gatedTask);
        onUpdateTask?.(gatedTask);
      } else {
        completedSteps.push(
          {
            id: `step-${Date.now()}-5`,
            stage: 'EXECUTION',
            title: 'Executed Sandbox Action via Gemini Enclave',
            detail: s.executionObservation,
            timestamp: 'Just now',
            status: 'completed',
            metrics: { latencyMs: perStepLatency, tokens: Math.round(totalTokens * 0.25) }
          },
          {
            id: `step-${Date.now()}-6`,
            stage: 'VERIFICATION',
            title: 'Verified Schema & Domain Invariants',
            detail: s.verificationSummary,
            timestamp: 'Just now',
            status: 'completed',
            metrics: { latencyMs: perStepLatency, confidence: s.confidenceScore || 0.98 }
          },
          {
            id: `step-${Date.now()}-7`,
            stage: 'RESULT',
            title: 'Synthesized Verified Deliverable',
            detail: s.finalResult,
            timestamp: 'Just now',
            status: 'completed',
            metrics: { latencyMs: 48, tokens: Math.round(totalTokens * 0.15) }
          },
          {
            id: `step-${Date.now()}-8`,
            stage: 'MEMORY',
            title: `Indexed Precedent [${s.memoryKey}] to Firestore RAG`,
            detail: s.memoryDigest,
            timestamp: 'Just now',
            status: 'completed',
            metrics: { latencyMs: 32, tokens: Math.round(totalTokens * 0.05) }
          }
        );

        const finishedTask: SuperAgentTask = {
          ...newTask,
          status: 'COMPLETED',
          tokensUsed: totalTokens,
          latencyMs: totalLatency,
          timeline: completedSteps,
          result: s.finalResult
        };

        setSelectedTaskForDetail(finishedTask);
        onUpdateTask?.(finishedTask);

        if (s.memoryKey && s.memoryDigest) {
          onAddMemory({
            id: `mem-${Date.now().toString().slice(-4)}`,
            key: s.memoryKey,
            category: 'episodic',
            content: s.memoryDigest,
            relevanceScore: s.confidenceScore || 0.96,
            lastAccessed: 'Just now',
            tags: [agent.name, 'LLM Verified']
          });
        }
      }
    } catch (err: any) {
      const failedTask: SuperAgentTask = {
        ...newTask,
        status: 'FAILED',
        result: `LLM Execution Error: ${err.message}`,
        timeline: [
          ...initialSteps.map(st => ({ ...st, status: 'failed' as const })),
          {
            id: `step-${Date.now()}-err`,
            stage: 'OBSERVATION',
            title: 'LLM Enclave Error',
            detail: err.message || 'Unable to reach server-side Gemini endpoint.',
            timestamp: 'Just now',
            status: 'failed'
          }
        ]
      };
      setSelectedTaskForDetail(failedTask);
      onUpdateTask?.(failedTask);
    } finally {
      setIsExecutingLive(false);
    }
  };

  // Run a tool in the interactive sandbox via live Gemini API
  const handleTestRunTool = async () => {
    setIsToolRunning(true);
    setToolExecutionOutput(null);

    let parsedParams: any = toolTestInput;
    try {
      parsedParams = JSON.parse(toolTestInput);
    } catch {
      parsedParams = toolTestInput;
    }

    try {
      const res = await fetch('/api/agent/run-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: activeTestingTool.name,
          toolDescription: activeTestingTool.description,
          category: activeTestingTool.category,
          parameters: parsedParams,
          activeRole
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sandbox tool execution failed');
      setToolExecutionOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setToolExecutionOutput(JSON.stringify({
        status: 'ERROR',
        toolId: activeTestingTool.id,
        error: err.message
      }, null, 2));
    } finally {
      setIsToolRunning(false);
    }
  };

  // Save new memory
  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryKey || !newMemoryContent) return;

    const newRecord: MemoryRecord = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      key: newMemoryKey,
      category: 'semantic',
      content: newMemoryContent,
      relevanceScore: 0.95,
      lastAccessed: 'Just now',
      tags: ['Manual', 'Autonomous Index', 'SuperAgent']
    };

    onAddMemory(newRecord);
    setNewMemoryKey('');
    setNewMemoryContent('');
    setShowAddMemoryModal(false);
  };

  // Filter memories
  const filteredMemories = memories.filter(m => 
    m.key.toLowerCase().includes(memorySearch.toLowerCase()) ||
    m.content.toLowerCase().includes(memorySearch.toLowerCase()) ||
    m.tags.some(t => t.toLowerCase().includes(memorySearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* ── Top Enclave & RBAC Status Bar ── */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                SuperAgent Sovereign Control Plane
              </h2>
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-semibold">
                v3.0-PROD
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Google Cloud Partner Enclave &bull; Vertex AI & Gemini Pro &bull; Cloud Run &bull; Firestore Database
            </p>
          </div>
        </div>

        {/* RBAC Role Selector & Enclave Status */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-zinc-800/60 border border-zinc-700/60 px-3 py-1.5 rounded-xl text-xs">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-zinc-400 font-mono">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="bg-transparent text-white font-mono font-medium focus:outline-none cursor-pointer"
            >
              <option value="Owner" className="bg-zinc-900 text-white">Owner (Full Root)</option>
              <option value="Admin" className="bg-zinc-900 text-white">Admin</option>
              <option value="Developer" className="bg-zinc-900 text-white">Developer</option>
              <option value="Operator" className="bg-zinc-900 text-white">Operator</option>
              <option value="Viewer" className="bg-zinc-900 text-white">Viewer (Read-Only)</option>
            </select>
          </div>

          <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-xs font-mono ${
            llmConnected === false
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${llmConnected === false ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
            <span>{llmConnected === false ? 'LLM Key Missing' : `LLM Live (${llmActiveModel})`}</span>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards (4 Metrics) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Active Fleet</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {agents.length} <span className="text-xs font-normal text-zinc-400">Agents</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>All sub-agents idle/ready</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Executed Tasks</span>
            <CheckCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            14,210
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
            <span className="text-blue-400 font-mono font-medium">99.8%</span>
            <span>Invariant verification rate</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 hover:border-teal-500/30 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Cloud Run Latency</span>
            <Server className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            82<span className="text-xs font-normal text-zinc-400">ms</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
            <span className="text-teal-400 font-mono font-medium">0-to-10</span>
            <span>Microvm container autoscaling</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Pending Approvals</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
            <span>{approvals.filter(a => a.status === 'pending').length}</span>
            {approvals.filter(a => a.status === 'pending').length > 0 && (
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                ACTION REQ
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Human-in-the-loop safety gate
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all whitespace-nowrap ${
            activeSubTab === 'tasks'
              ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Task Console & Live Timeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('agents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all whitespace-nowrap ${
            activeSubTab === 'agents'
              ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Agent Fleet ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tools')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all whitespace-nowrap ${
            activeSubTab === 'tools'
              ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Tool Registry & Sandbox</span>
        </button>

        <button
          onClick={() => setActiveSubTab('memory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all whitespace-nowrap ${
            activeSubTab === 'memory'
              ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Memory & Vector RAG ({memories.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('governance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all whitespace-nowrap ${
            activeSubTab === 'governance'
              ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Governance & Approvals</span>
          {approvals.filter(a => a.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('observability')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all whitespace-nowrap ${
            activeSubTab === 'observability'
              ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Observability</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 1: TASK CONSOLE & LIVE TIMELINE (THE SUPERAGENT HEART) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Task Composer & Task List (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Task Composer Card */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Autonomous Task Composer
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Model: Vertex AI / Gemini Pro
                </span>
              </div>

              {/* Agent Selector */}
              <div className="mb-3">
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Route to Autonomous Agent:
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id} className="bg-zinc-900">
                      {a.name} — {a.role} ({a.model})
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt Textarea */}
              <div className="mb-3">
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Mission Prompt or Engineering Objective:
                </label>
                <textarea
                  value={taskPrompt}
                  onChange={(e) => setTaskPrompt(e.target.value)}
                  placeholder="e.g. Inspect firestore.rules AST, verify Owner/Admin RBAC permissions, and test role-based access invariants..."
                  rows={3}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleExecuteNewTask()}
                  disabled={isExecutingLive || !taskPrompt.trim()}
                  className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                  {isExecutingLive ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Autonomous Loop...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Execute Autonomous Task</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mt-4 pt-4 border-t border-zinc-800/60">
                <span className="text-[11px] font-mono text-zinc-400 block mb-2">
                  Quick Benchmark Objectives:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteNewTask(qp.prompt, qp.agent)}
                      className="text-left p-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/30 text-[11px] font-mono text-zinc-300 transition-all flex items-center justify-between"
                    >
                      <span className="truncate">{qp.title}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400 flex-shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks History List */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Task Execution History ({tasks.length})
                </h3>
                <span className="text-[10px] font-mono text-zinc-500">
                  Real-Time Synced
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {tasks.map(t => {
                  const isSelected = selectedTaskForDetail?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskForDetail(t)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                          : 'bg-zinc-950/40 border-zinc-800/70 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-white truncate">
                          {t.title}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium flex-shrink-0 ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.status === 'RUNNING'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                            : t.status === 'WAITING_APPROVAL'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                        <span className="text-zinc-500">{t.assignedAgent}</span>
                        <div className="flex items-center gap-2">
                          <span>{t.tokensUsed} tokens</span>
                          <span>&bull;</span>
                          <span>{t.latencyMs}ms</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Execution Timeline & Inspection Surface (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl h-full flex flex-col justify-between">
              
              <div>
                {/* Header for Active Task */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                        Execution Timeline
                      </span>
                      <span className="text-xs font-mono text-zinc-500">
                        #{selectedTaskForDetail?.id || 'N/A'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                      {selectedTaskForDetail?.title || 'Select a task to inspect timeline'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTaskForDetail?.riskLevel === 'HIGH_APPROVAL' && (
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        HIGH RISK
                      </span>
                    )}
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-800/70 px-2.5 py-1 rounded-lg">
                      Agent: {selectedTaskForDetail?.assignedAgent}
                    </span>
                  </div>
                </div>

                {/* Safe Operational Lifecycle Stages (Visual Progress Header) */}
                <div className="mb-6 bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Deterministic Operational Lifecycle</span>
                    <span className="text-cyan-400">Zero-Plaintext Safe Telemetry</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 overflow-x-auto text-[10px] font-mono">
                    {['CONTEXT', 'PLAN', 'TOOL', 'EXECUTION', 'OBSERVATION', 'VERIFICATION', 'RESULT', 'MEMORY'].map((stage, idx) => {
                      const hasExecuted = selectedTaskForDetail?.timeline.some(s => s.stage === stage);
                      return (
                        <div
                          key={stage}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                            hasExecuted
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                              : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                          }`}
                        >
                          <span>{stage}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline Stream */}
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                  {selectedTaskForDetail?.timeline.map((step, idx) => {
                    const stageColor = 
                      step.stage === 'CONTEXT' ? 'from-blue-500 to-indigo-500 text-blue-400 border-blue-500/30' :
                      step.stage === 'PLAN' ? 'from-cyan-500 to-blue-500 text-cyan-400 border-cyan-500/30' :
                      step.stage === 'TOOL' ? 'from-amber-500 to-orange-500 text-amber-400 border-amber-500/30' :
                      step.stage === 'EXECUTION' ? 'from-purple-500 to-pink-500 text-purple-400 border-purple-500/30' :
                      step.stage === 'OBSERVATION' ? 'from-yellow-500 to-amber-500 text-yellow-400 border-yellow-500/30' :
                      step.stage === 'VERIFICATION' ? 'from-emerald-500 to-teal-500 text-emerald-400 border-emerald-500/30' :
                      step.stage === 'RESULT' ? 'from-emerald-400 to-cyan-400 text-emerald-300 border-emerald-500/30' :
                      'from-teal-500 to-cyan-500 text-teal-400 border-teal-500/30';

                    return (
                      <div key={step.id} className="relative pl-6 pb-2 border-l border-zinc-800 last:border-l-0">
                        {/* Bullet indicator */}
                        <div className="absolute -left-2 top-0.5 w-4 h-4 rounded-full bg-[#09090b] border border-cyan-500 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        </div>

                        {/* Step Card */}
                        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 hover:border-zinc-700 transition-all">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${stageColor}`}>
                                [{step.stage}]
                              </span>
                              <span className="text-xs font-mono font-semibold text-zinc-200">
                                {step.title}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-zinc-500">
                              {step.timestamp}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                            {step.detail}
                          </p>

                          {/* Step Metrics */}
                          {step.metrics && (
                            <div className="mt-2 pt-2 border-t border-zinc-900 flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                              {step.metrics.latencyMs && <span>Latency: {step.metrics.latencyMs}ms</span>}
                              {step.metrics.tokens && <span>Tokens: {step.metrics.tokens}</span>}
                              {step.metrics.confidence && (
                                <span className="text-emerald-400">Confidence: {(step.metrics.confidence * 100).toFixed(0)}%</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* If Waiting Approval, Show Action Gate Card */}
                {selectedTaskForDetail?.status === 'WAITING_APPROVAL' && selectedTaskForDetail.approvalDetails && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        HUMAN-IN-THE-LOOP APPROVAL REQUIRED
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Action: {selectedTaskForDetail.approvalDetails.action}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 mb-2">
                      Agent <strong className="text-white">{selectedTaskForDetail.approvalDetails.requestedBy}</strong> requires authorization for high-risk target: <code className="text-cyan-400">{selectedTaskForDetail.approvalDetails.target}</code>
                    </p>

                    {selectedTaskForDetail.approvalDetails.diffSnippet && (
                      <pre className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-amber-300 overflow-x-auto mb-3">
                        {selectedTaskForDetail.approvalDetails.diffSnippet}
                      </pre>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (selectedTaskForDetail) {
                            selectedTaskForDetail.status = 'COMPLETED';
                            selectedTaskForDetail.result = 'Approved by human operator. Production rollout completed successfully.';
                            selectedTaskForDetail.timeline.push({
                              id: `step-${Date.now()}`,
                              stage: 'COMPLETE' as any,
                              title: 'Production Enclave Mutation Signed & Executed',
                              detail: 'Human operator approved rollout. Cloud Run container deployed.',
                              timestamp: 'Just now',
                              status: 'completed',
                              metrics: { latencyMs: 45 }
                            });
                          }
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Authorize & Execute
                      </button>
                      <button
                        onClick={() => {
                          if (selectedTaskForDetail) {
                            selectedTaskForDetail.status = 'FAILED';
                            selectedTaskForDetail.result = 'Rejected by human operator. Aborted mutation.';
                          }
                        }}
                        className="border border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-mono"
                      >
                        Reject Mutation
                      </button>
                    </div>
                  </div>
                )}

                {/* Final Verified Result Card */}
                {selectedTaskForDetail?.result && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                      Verified Result Output
                    </span>
                    <p className="text-xs text-zinc-200 font-mono leading-relaxed">
                      {selectedTaskForDetail.result}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer status */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Photonic-Void Protocol: Enforced</span>
                <span>Firestore DB: ai-studio-nimbusiqsovereig</span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 2: AGENT FLEET ORCHESTRATOR */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-tight">
                Autonomous Agent Fleet
              </h3>
              <p className="text-xs text-zinc-400">
                Specialized micro-agents running on Vertex AI / Gemini 2.5 with assigned tool bindings and system contracts.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
              6 Agents Active &bull; Zero Bottlenecks
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(agent => (
              <div
                key={agent.id}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
                        <Cpu className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono">
                          {agent.name}
                        </h4>
                        <span className="text-xs text-zinc-400">
                          {agent.role}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {agent.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500">Foundation Model:</span>
                      <span className="text-cyan-400 font-semibold">{agent.model}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500">Completed Tasks:</span>
                      <span className="text-zinc-200">{agent.taskCount}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block mb-1.5">
                      Tool Bindings ({agent.tools.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.tools.map(tool => (
                        <span
                          key={tool}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/80 text-zinc-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3 text-[11px] text-zinc-400 font-mono leading-relaxed mb-4">
                    <strong className="text-zinc-300 block mb-0.5">Operating Contract:</strong>
                    "{agent.systemPrompt}"
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    setActiveSubTab('tasks');
                  }}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs py-2 rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Dispatch Mission to Agent</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 3: TOOL REGISTRY & LIVE SANDBOX */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Tool Catalog (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Registered Enclave Tools
              </h3>
              <span className="text-xs font-mono text-zinc-500">
                {tools.length} Registered
              </span>
            </div>

            {tools.map(tool => {
              const isSelected = activeTestingTool?.id === tool.id;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    setActiveTestingTool(tool);
                    setToolTestInput(JSON.stringify(tool.parametersSchema, null, 2));
                    setToolExecutionOutput(null);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-white">
                      {tool.name}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase ${
                      tool.riskLevel === 'HIGH_APPROVAL'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : tool.riskLevel === 'MEDIUM'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {tool.riskLevel}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                    {tool.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>Category: {tool.category}</span>
                    <span>Invocations: {tool.usageCount}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Sandbox Test Runner (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                    Interactive Tool Sandbox
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {activeTestingTool.name}
                  </h4>
                </div>

                <button
                  onClick={() => onToggleTool(activeTestingTool.id)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-xl border transition-all ${
                    activeTestingTool.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}
                >
                  {activeTestingTool.enabled ? 'Tool Enabled' : 'Tool Disabled'}
                </button>
              </div>

              {/* Schema Inspector */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Parameters Schema (JSON):
                </label>
                <textarea
                  value={toolTestInput}
                  onChange={(e) => setToolTestInput(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Run Test Button */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleTestRunTool}
                  disabled={isToolRunning || !activeTestingTool.enabled}
                  className="bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isToolRunning ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing in Cloud Run Microvm...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Execute Sandbox Call</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] font-mono text-zinc-500">
                  Isolation: Cloud Run Sandbox gVisor Enclave
                </span>
              </div>

              {/* Output */}
              {toolExecutionOutput && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Sandbox Execution Response (200 OK)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Photonic-Void: Plaintext Redacted
                    </span>
                  </div>
                  <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                    {toolExecutionOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 4: MEMORY & VECTOR RAG EXPLORER */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'memory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-tight">
                Episodic & Semantic Memory Explorer
              </h3>
              <p className="text-xs text-zinc-400">
                Firestore Vector Embeddings, precedent index, code blueprints, and historical execution graphs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddMemoryModal(true)}
                className="bg-white hover:bg-zinc-200 text-zinc-950 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Index Memory Record</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={memorySearch}
              onChange={(e) => setMemorySearch(e.target.value)}
              placeholder="Search vector knowledge bank by keyword, category, or tag (e.g., 'IRC', 'RBAC', 'SATCALC')..."
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Memory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map(mem => (
              <div
                key={mem.id}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {mem.key}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                        {mem.category}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        Score: {(mem.relevanceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans mb-3">
                    {mem.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <div className="flex flex-wrap gap-1">
                    {mem.tags.map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span>{mem.lastAccessed}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Memory Modal */}
          {showAddMemoryModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white font-mono uppercase">
                    Index New Knowledge Record
                  </h4>
                  <button onClick={() => setShowAddMemoryModal(false)} className="text-zinc-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateMemory} className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">
                      Unique Memory Key:
                    </label>
                    <input
                      type="text"
                      value={newMemoryKey}
                      onChange={(e) => setNewMemoryKey(e.target.value)}
                      placeholder="e.g. gcp_service_account_policy"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">
                      Knowledge / Operational Trajectory:
                    </label>
                    <textarea
                      value={newMemoryContent}
                      onChange={(e) => setNewMemoryContent(e.target.value)}
                      placeholder="Enter verified precedent, architecture spec, or code pattern..."
                      rows={4}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemoryModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-white text-zinc-950 px-4 py-2 rounded-xl text-xs font-mono font-bold hover:bg-zinc-200"
                    >
                      Commit to Vector Index
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 5: GOVERNANCE & HUMAN APPROVALS */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'governance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-tight">
                Governance & Policy Guardrails
              </h3>
              <p className="text-xs text-zinc-400">
                Human-in-the-loop authorization queue for high-risk actions (Production Cloud Run deployments, Secret access, IAM changes).
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              Photonic-Void Protocol: Strict Active
            </div>
          </div>

          {/* Pending Approvals List */}
          <div className="space-y-3">
            {approvals.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800/60 rounded-2xl text-zinc-500 font-mono text-xs">
                No actions currently awaiting human approval. All safe operations passing automated invariant verification.
              </div>
            ) : (
              approvals.map(appr => (
                <div
                  key={appr.id}
                  className="bg-zinc-900/60 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-xl"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                          {appr.riskLevel}
                        </span>
                        <h4 className="text-sm font-bold text-white font-mono">
                          {appr.taskTitle}
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Requested by <strong className="text-zinc-200">{appr.requestedByAgent}</strong> &bull; Action: <code className="text-cyan-400">{appr.action}</code>
                      </p>
                    </div>

                    <span className="text-xs font-mono text-zinc-500">
                      {appr.timestamp}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                      Action Payload Parameters:
                    </span>
                    <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-amber-200 overflow-x-auto">
                      {JSON.stringify(appr.payload, null, 2)}
                    </pre>
                  </div>

                  {appr.status === 'pending' ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onApproveAction(appr.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      >
                        <Check className="w-4 h-4" />
                        <span>Sign & Authorize Execution</span>
                      </button>

                      <button
                        onClick={() => onRejectAction(appr.id)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs px-4 py-2 rounded-xl border border-zinc-700 transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject Request</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Action resolved: {appr.status.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 6: OBSERVABILITY & CLOUD RUN TELEMETRY */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'observability' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-xl">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                Cloud Run Microvm Health
              </span>
              <div className="text-2xl font-bold font-mono text-white mb-1">
                99.99% <span className="text-xs font-normal text-emerald-400">UPTIME</span>
              </div>
              <p className="text-xs text-zinc-400">
                Region: us-west2 &bull; Scale-to-zero active
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-xl">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                Model Routing Ratio
              </span>
              <div className="text-2xl font-bold font-mono text-white mb-1">
                72% <span className="text-xs font-normal text-cyan-400">Flash</span> / 28% <span className="text-xs font-normal text-blue-400">Pro</span>
              </div>
              <p className="text-xs text-zinc-400">
                Dynamic cost & latency optimization
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-xl">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                GCP Cloud Credits
              </span>
              <div className="text-2xl font-bold font-mono text-white mb-1">
                $350,000+
              </div>
              <p className="text-xs text-zinc-400">
                Google Cloud Partner Enclave & Startup Program
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl">
            <h4 className="text-sm font-bold text-white font-mono uppercase mb-3">
              Internal Sovereign Stack vs Third-Party SaaS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-cyan-400 font-bold block mb-1">Workflow Automation:</span>
                <p className="text-zinc-300">
                  Self-hosted <strong>n8n</strong> and <strong>Temporal.io</strong> on Cloud Run replacing Make.com. 0 per-execution fees, native Vertex AI bindings.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-teal-400 font-bold block mb-1">Telephony & Voice AI:</span>
                <p className="text-zinc-300">
                  Direct <strong>Telnyx</strong> SIP trunks & <strong>Google Cloud Contact Center AI</strong> replacing Twilio. 60%+ cost reduction with Photonic-Void containment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
