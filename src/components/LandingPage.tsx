import React, { useState } from 'react';
import { 
  Zap, Shield, Calculator, FileCheck, Layers, Cpu, ArrowRight, 
  CheckCircle2, ChevronDown, ChevronUp, Globe, Sparkles, ExternalLink,
  Award, TrendingUp, Building2, Flame, HelpCircle, HardHat, Compass,
  Database, RefreshCw, BarChart3, Lock, Terminal, Server, Sliders, CheckCheck
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenAudit: () => void;
  onSelectFeature?: (tab: 'superagent' | 'claims' | 'satcalc' | 'cloudflare' | 'saas') => void;
}

export default function LandingPage({ onLaunchApp, onOpenAudit, onSelectFeature }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Live Preview state on Landing Page
  const [previewStage, setPreviewStage] = useState<'IDLE' | 'CONTEXT' | 'PLAN' | 'TOOL' | 'EXECUTION' | 'VERIFICATION' | 'COMPLETE'>('COMPLETE');
  const [previewActiveStep, setPreviewActiveStep] = useState<number>(5);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const runPreviewSimulation = () => {
    setPreviewStage('CONTEXT');
    setPreviewActiveStep(1);

    setTimeout(() => {
      setPreviewStage('PLAN');
      setPreviewActiveStep(2);
    }, 800);

    setTimeout(() => {
      setPreviewStage('TOOL');
      setPreviewActiveStep(3);
    }, 1600);

    setTimeout(() => {
      setPreviewStage('EXECUTION');
      setPreviewActiveStep(4);
    }, 2400);

    setTimeout(() => {
      setPreviewStage('VERIFICATION');
      setPreviewActiveStep(5);
    }, 3200);

    setTimeout(() => {
      setPreviewStage('COMPLETE');
      setPreviewActiveStep(6);
    }, 4000);
  };

  const faqs = [
    {
      q: "What is the SuperAgent Mental Model and Operating Lifecycle?",
      a: "SuperAgent transforms traditional web architecture (User → Page → Database) into an autonomous goal-directed engine: User → Task → Context → Plan → Tools → Execution → Observation → Verification → Result → Memory. It executes tools, checks schema invariants, and verifies every claim before committing to memory or presenting output."
    },
    {
      q: "How does SuperAgent separate Firebase from Google Cloud Run?",
      a: "Firebase serves as the application layer (App Hosting, Firebase Authentication with granular RBAC, Firestore state, and Storage). Google Cloud Run, Vertex AI, and Cloud SQL provide the execution infrastructure. The SuperAgent Runtime acts as the nervous system orchestrating Context, Tools, Planning, and Verification."
    },
    {
      q: "What internal sovereign alternatives does Nimbus deploy instead of Make and Twilio?",
      a: "To eliminate per-execution markups and vendor lock-in, Nimbus deploys self-hosted n8n on Google Cloud Run enclaves (billed against our $350K+ Google Cloud Partner credits for unlimited workflows), Temporal.io for durable transaction states, and direct Telnyx SIP enclaves alongside Google Cloud Contact Center AI—slashing telecommunications costs by over 60% while maintaining Photonic-Void data containment."
    },
    {
      q: "How does the Governance & Human-in-the-Loop policy gate work?",
      a: "Low and medium-risk actions execute autonomously inside gVisor-isolated microvms. High-risk actions—such as production container deployments, secret key rotations, or database schema mutations—automatically pause at the [OBSERVATION] gate and route to the Governance Queue for human cryptographic sign-off."
    },
    {
      q: "How does the domain-specific SATCALC v2 Engine operate?",
      a: "SATCALC v2 applies deterministic trigonometry to 2D building footprints: Slope Factor SF = √(Rise² + 12²) / 12 and Hip/Valley Multipliers HVF = √(2 + (Rise/12)²). Multiplied by geometry-adjusted waste (12%–20%), SATCALC calculates true 3D material squares, preventing adjuster line-item omissions under Texas IRC R905.2.8.2."
    },
    {
      q: "What is the Photonic-Void Protocol?",
      a: "Photonic-Void is our strict zero-plaintext security directive. Under no circumstances are raw API tokens, database URIs, or internal system secrets exposed to client-side logs or browser memory. All credentials reside in Google Cloud Secret Manager and ephemeral runtime proxies."
    }
  ];

  return (
    <div className="w-full text-zinc-200">
      
      {/* ── Top Announcement Bar ── */}
      <div className="w-full bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-teal-500/10 border-b border-cyan-500/20 py-2.5 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-mono">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-zinc-400">Google Cloud Partner Enclave &bull; $350K+ Cloud Credits &bull; Vertex AI & Gemini Pro &bull;</span>
          <span className="text-cyan-400 font-semibold uppercase tracking-wider">Photonic-Void Protocol Active</span>
        </div>
      </div>

      {/* ── Navigation Bar ── */}
      <header className="sticky top-0 z-40 w-full bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] flex-shrink-0">
              <Zap className="w-6 h-6 fill-current animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                  SuperAgent <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">by Nimbus iQ AI</span>
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-medium hidden sm:inline-block">
                  Built on Vertex AI
                </span>
              </div>
              <p className="text-xs text-zinc-400 tracking-tight font-sans">
                Autonomous AI Execution Surface &bull; Firebase + Cloud Run Control Plane
              </p>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAudit}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-zinc-300 border border-zinc-700/80 hover:bg-zinc-800 transition-all"
            >
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sovereign Audit (Grade A)</span>
            </button>

            <button
              onClick={onLaunchApp}
              className="bg-white hover:bg-zinc-200 text-zinc-950 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
            >
              <span>Launch SuperAgent</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ── Hero Section with Dual CTAs ── */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/15 to-teal-400/10 blur-[130px] -z-10 pointer-events-none rounded-full" />

        <div className="text-center max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 mb-8 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-400 font-semibold">Vertex AI &bull; Cloud Run &bull; Firebase</span>
            <span className="text-zinc-500">|</span>
            <span>The Autonomous Control Surface</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            The Autonomous AI{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Control Surface
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            SuperAgent is not just a website. It is the visual control surface for an autonomous system that can <strong>research, reason, retrieve knowledge, inspect code, execute tools, manage memory, and deploy software</strong>—backed by Google Cloud Partner infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 px-8 py-4 rounded-xl font-mono text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95"
            >
              <span>Launch Autonomous Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAudit}
              className="w-full sm:w-auto border border-zinc-700 hover:bg-zinc-800/80 text-white px-8 py-4 rounded-xl font-mono text-sm transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Inspect Architecture Spec</span>
            </button>
          </div>

        </div>

        {/* ── Interactive Live Cockpit Preview on Landing Page ── */}
        <div className="mt-16 bg-zinc-900/70 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  SuperAgent Live Execution Sandbox
                </span>
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  Interactive Preview
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-mono mt-1">
                Objective: Reconcile Code Invariants & Deploy Microservice
              </h3>
            </div>

            <button
              onClick={runPreviewSimulation}
              className="bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-500/30 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Re-run Lifecycle Simulation</span>
            </button>
          </div>

          {/* Visual Lifecycle Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { num: 1, label: 'CONTEXT', desc: 'Vector RAG & AST Graph' },
              { num: 2, label: 'PLAN', desc: 'Action Graph Decomposition' },
              { num: 3, label: 'TOOL', desc: 'Code Graph & Sandbox' },
              { num: 4, label: 'EXECUTE', desc: 'Cloud Run Isolated Microvm' },
              { num: 5, label: 'VERIFY', desc: 'Schema & Invariant Check' },
              { num: 6, label: 'MEMORY', desc: 'Indexed to Firestore Bank' }
            ].map((st) => (
              <div
                key={st.num}
                className={`p-3 rounded-xl border transition-all ${
                  previewActiveStep >= st.num
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-white'
                    : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold">
                    STEP {st.num}
                  </span>
                  {previewActiveStep >= st.num && (
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  )}
                </div>
                <div className="text-xs font-mono font-bold text-cyan-300">
                  [{st.label}]
                </div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {st.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Terminal Output Window */}
          <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2">
            <div className="flex items-center justify-between text-zinc-500 pb-2 border-b border-zinc-900 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="text-zinc-400 ml-2">superagent://runtime/execution-timeline</span>
              </div>
              <span>Latency: 74ms &bull; Zero Leakage</span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="text-blue-400">[CONTEXT] 3 memory records loaded: [firebase-blueprint.json, RBAC security policy, SATCALC trig model].</div>
              <div className="text-cyan-400">[PLAN] Formulate deterministic action graph. Inspect AST symbol table before mutating container.</div>
              <div className="text-amber-400">[TOOL] Code Graph Inspector selected. AST parsed 42 symbol nodes in firestore.rules.</div>
              <div className="text-purple-400">[EXECUTION] Cloud Run container sandbox executed in us-west2. Zero plain-text tokens leaked.</div>
              <div className="text-emerald-400">[VERIFICATION] Schema validation passed. Invariant assertion checks: 100% SUCCESS.</div>
              <div className="text-teal-300">[COMPLETE] Implementation ready and committed to episodic memory index.</div>
            </div>
          </div>

        </div>

      </section>

      {/* ── Stats / Metrics Bar ── */}
      <section className="border-y border-zinc-800/80 bg-zinc-950/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              14,210+
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
              Autonomous Tasks Executed
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-cyan-400 tracking-tight">
              99.94%
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
              Invariant Verification Rate
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-teal-400 tracking-tight">
              &lt; 85ms
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
              Cloud Run Enclave Latency
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-blue-400 tracking-tight">
              $350K+
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
              GCP Startup Partner Credits
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section (3-Step Visual Flow) ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold block mb-2">
            The SuperAgent Execution Loop
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            How SuperAgent Solves Real Problems
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Eliminating passive LLM guesswork. Every request passes through a deterministic three-tier execution pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 relative hover:border-blue-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-lg mb-5">
              01
            </div>
            <h3 className="text-lg font-bold text-white font-mono mb-2">
              Context & Knowledge RAG
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Before taking any action, the runtime loads long-term episodic memory, code graphs, and domain building codes from Firestore vector tables. No blind generations.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 relative hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-lg mb-5">
              02
            </div>
            <h3 className="text-lg font-bold text-white font-mono mb-2">
              Safe Tool Routing
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Decomposes goals into a deterministic plan. Calls sandboxed tools—Code Graph Inspector, Cloud Run Deployer, SATCALC Trig Engine—in isolated microvm containers.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 relative hover:border-teal-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-lg mb-5">
              03
            </div>
            <h3 className="text-lg font-bold text-white font-mono mb-2">
              Verification & Governance
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              All outputs pass mathematical or AST invariant checks. High-risk mutations (production deployments, secrets) pause for Human-in-the-Loop cryptographic signoff.
            </p>
          </div>

        </div>
      </section>

      {/* ── Feature / Capability Grid (6 Items) ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold block mb-2">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Engineered for Sovereign Independence
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Self-hosted infrastructure replacing costly point SaaS wrappers and insecure APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-cyan-500/30 transition-all">
            <Cpu className="w-6 h-6 text-cyan-400 mb-3" />
            <h4 className="text-sm font-bold text-white font-mono mb-1">
              Autonomous Multi-Agent Fleet
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              6 specialized agents for AST analysis, serverless deployment, vector memory retrieval, policy governance, and domain math.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-blue-500/30 transition-all">
            <Server className="w-6 h-6 text-blue-400 mb-3" />
            <h4 className="text-sm font-bold text-white font-mono mb-1">
              Google Cloud Run Microvms
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Serverless container execution enclaves running in us-west2 with sub-90ms cold starts and scale-to-zero cost efficiency.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-teal-500/30 transition-all">
            <Database className="w-6 h-6 text-teal-400 mb-3" />
            <h4 className="text-sm font-bold text-white font-mono mb-1">
              Firebase Application Layer
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Firebase Auth with granular RBAC (Owner, Admin, Developer, Operator), Firestore operational database, and App Hosting.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
            <Shield className="w-6 h-6 text-amber-400 mb-3" />
            <h4 className="text-sm font-bold text-white font-mono mb-1">
              Photonic-Void Protocol
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero plaintext secret leakage. Runtime credential proxies and automated secret scanning block all accidental disclosures.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
            <Calculator className="w-6 h-6 text-purple-400 mb-3" />
            <h4 className="text-sm font-bold text-white font-mono mb-1">
              SATCALC v2 Slope Solver
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Pure trigonometric slope factoring: SF = √(Rise² + 12²)/12. Audits multi-facet geometry and IRC R905 building codes.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
            <Lock className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="text-sm font-bold text-white font-mono mb-1">
              Self-Hosted n8n & Telnyx
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Internal sovereignty: Replaces Make.com with self-hosted n8n workflows and Twilio with direct Telnyx SIP enclaves.
            </p>
          </div>

        </div>
      </section>

      {/* ── FAQ Section (Expandable Accordion) ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-zinc-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold block mb-2">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            Architecture & Operations
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Everything you need to know about the SuperAgent Sovereign Control Plane.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-mono text-sm font-semibold text-zinc-200 hover:text-white"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 font-sans leading-relaxed border-t border-zinc-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Mandatory Compliant Footer ── */}
      <footer className="border-t border-zinc-800 bg-[#09090b] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-white font-bold">
                Nimbus iQ AI, LLC
              </div>
              <p className="text-[11px] text-zinc-400">
                Founded by Dustin Moore &bull; Google Cloud Partner Startup
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[11px]">
            <span>nimbusiq.ai</span>
            <span>&bull;</span>
            <span>contact@nimbusiq.ai</span>
            <span>&bull;</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>

          <div className="text-zinc-400 font-mono text-[11px]">
            &copy; 2025 Nimbus iQ AI, LLC. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
