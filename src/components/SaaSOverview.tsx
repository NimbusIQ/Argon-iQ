import React, { useState } from 'react';
import { 
  Layers, Shield, Target, Award, Map, RefreshCw, 
  TrendingUp, Compass, Cpu, Search, Lock, Zap 
} from 'lucide-react';
import { SAAS_BIFURCATION_TEXT } from '../data';

export default function SaaSOverview() {
  const [activeConcept, setActiveConcept] = useState<'bifurcation' | 'moats' | 'marketing'>('bifurcation');

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Intro Header */}
      <div className="bg-[#0c0c12] border border-white/5 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full">
            Strategic Dissertation & Pitch
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
            The Sovereign OS Paradigm
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed font-sans">
            Synthesizing generative agency with Systems of Record to solve real-world physical asset restoration. We avoid lightweight point solutions and API "thin wrappers," building deep-workflow structural moats.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-1">
        {[
          { id: 'bifurcation', label: 'The Great SaaS Bifurcation', icon: <Layers className="w-4 h-4" /> },
          { id: 'moats', label: 'AI Moats 2.0 Architectural Moats', icon: <Shield className="w-4 h-4" /> },
          { id: 'marketing', label: 'Sovereign SEO & Agency Blueprint', icon: <Compass className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveConcept(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
              activeConcept === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      {activeConcept === 'bifurcation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0c0c12]/60 border border-white/5 p-8 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="text-cyan-400 w-5 h-5" />
                The Decoupling of Moats
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {SAAS_BIFURCATION_TEXT.summary}
              </p>
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 text-yellow-400/90 rounded-2xl text-xs leading-relaxed font-mono">
                <span className="font-bold uppercase block mb-1">🚨 The SaaSpocalypse Trigger</span>
                API wrappers built for generic tasks suffer extremely high churn (~65%) and zero defensibility. True value transfers entirely to proprietary orchestration layers.
              </div>
            </div>

            <div className="bg-[#0c0c12]/60 border border-white/5 p-8 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-red-400 uppercase tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {SAAS_BIFURCATION_TEXT.losers.title}
              </h3>
              <ul className="space-y-3">
                {SAAS_BIFURCATION_TEXT.losers.points.map((pt, idx) => (
                  <li key={idx} className="text-xs text-slate-400 flex items-start gap-3">
                    <span className="text-red-500 font-mono mt-0.5">✕</span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0c0c12]/60 border border-white/5 p-8 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-emerald-400 tracking-tight flex items-center gap-2 uppercase">
                <Shield className="w-5 h-5" />
                {SAAS_BIFURCATION_TEXT.winners.title}
              </h3>
              <ul className="space-y-3">
                {SAAS_BIFURCATION_TEXT.winners.points.slice(0, 3).map((pt, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-3">
                    <span className="text-emerald-400 font-mono mt-0.5">✓</span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0c0c12]/60 border border-white/5 p-8 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                The Shift in Monetization
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {SAAS_BIFURCATION_TEXT.monetization.desc}
              </p>
              <div className="grid grid-cols-2 gap-3 text-center pt-2 font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">OLD PARADIGM</span>
                  <span className="text-xs text-red-400 font-bold uppercase mt-1 block">Seat-Based Seats</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/20">
                  <span className="text-[10px] text-slate-500 block">NEW PARADIGM</span>
                  <span className="text-xs text-emerald-400 font-bold uppercase mt-1 block">Outcome-Based Value</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeConcept === 'moats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl space-y-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase font-mono">1. The Edge-Case Moat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decades of complex residential building codes, structural wind-rating tables, localized municipality requirements, and specific carrier compliance protocols that standard LLMs constantly hallucinate.
            </p>
            <div className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10">
              EXAMPLE: McKinney municipal drip-edge requirements under International Residential Code R905.2.8.2.
            </div>
          </div>

          <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl space-y-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase font-mono">2. Data Gravity & Permissions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Durable multi-tenant records housed directly inside the enterprise cloud environment. Real estate, owner structures, claim history, and certified certificates hold the authority required to enforce payout events.
            </p>
            <div className="text-[10px] font-mono text-purple-400/80 bg-purple-500/5 p-3 rounded-xl border border-purple-500/10">
              EXAMPLE: Authenticated Navy Federal credit-union payout records synced automatically to ledger.
            </div>
          </div>

          <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase font-mono">3. Distribution Advantage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              An established orchestration layer that serves as the strategic point-of-entry. As automated insurance estimators proliferate, they remain dependent on Nimbus IQ's structural calculations to interact with adjusters.
            </p>
            <div className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
              EXAMPLE: Live integrations with general contractors and regional restoration firms.
            </div>
          </div>
        </div>
      )}

      {activeConcept === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0c0c12]/60 border border-white/5 p-8 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Search className="text-cyan-400 w-5 h-5" />
                The 2026 Semantic SEO Blueprint
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rather than obsolete keyword-stuffing, Nimbus Roofing leverages **Entities and Vectors** linked directly to Google's Knowledge Graph APIs. This coordinates immediate regional authority when storms strike.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-white font-mono uppercase">NAP Unified Sync</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Name, Address, and Phone data structurally bound across all 77 DFW geographic hubs, boosting local localized indexing.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 font-mono uppercase">Google Guarantee Badge</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Structured schema schema verification injection signaling licensing validity directly into Google local rankings.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0c0c12]/60 border border-white/5 p-8 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Campaign Targeting Vectors
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-black/40 border border-cyan-500/10 rounded-xl flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[9px] font-mono uppercase font-bold mt-0.5">HAIL</span>
                  <div>
                    <span className="font-bold text-white block">Meteorological Footprints</span>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">Targeting McKinney, Prosper, Frisco immediately upon NOAA radar verification of &gt;1" hail.</span>
                  </div>
                </div>
                <div className="p-3 bg-black/40 border border-purple-500/10 rounded-xl flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[9px] font-mono uppercase font-bold mt-0.5">TEAR_OFF</span>
                  <div>
                    <span className="font-bold text-white block">Total Roof Restorations</span>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">Scanning property tax histories and age structures to identify roofs exceeding 15-year limits.</span>
                  </div>
                </div>
                <div className="p-3 bg-black/40 border border-emerald-500/10 rounded-xl flex items-start gap-3">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-mono uppercase font-bold mt-0.5">GC_PORTAL</span>
                  <div>
                    <span className="font-bold text-white block">B2B Paid Estimations</span>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">Dedicated portal for general contractors to upload scope-of-work sheets for automated valuation pricing.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0c0c12]/60 border border-white/5 p-8 rounded-3xl flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Award className="text-yellow-400 w-4 h-4" />
                Sovereign PWA Inbound Pipeline
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a high-intent homeowner visits `nimbusroofing.com`, they don't meet a dry marketing page. They trigger a sovereign machine:
              </p>
              
              <div className="space-y-3 font-mono text-[11px]">
                {[
                  { num: '01', title: 'SEO Ingress', desc: 'Sovereign schema queries direct user into high-contrast portal.' },
                  { num: '02', title: 'ClaimCore RAG Scan', desc: 'Homeowner drops their adjuster estimate; model scans for local code omissions.' },
                  { num: '03', title: 'A2A Handshake', desc: 'CEO Agent triggers the CRM and compiles legal notification package.' },
                  { num: '04', title: 'Instant Execution', desc: 'Supplement paperwork structured and scheduled without manual clicks.' }
                ].map((step) => (
                  <div key={step.num} className="p-3 bg-slate-950 rounded-xl border border-white/5 flex gap-3">
                    <span className="text-cyan-400 font-bold">{step.num}</span>
                    <div>
                      <span className="text-white block font-sans font-bold text-xs">{step.title}</span>
                      <span className="text-slate-400 text-[10px] mt-0.5 block font-sans">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
