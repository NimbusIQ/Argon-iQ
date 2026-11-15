import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, ShieldCheck, Calculator, Search, Filter, 
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, Sparkles, ExternalLink,
  Plus, RefreshCw, Database, Layers, ArrowRight, UserCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Claim, DomainMetric } from '../types';

interface DashboardOverviewProps {
  claims: Claim[];
  domains: DomainMetric[];
  onSelectClaim: (claimId: string) => void;
  onNavigateTab: (tab: 'claims' | 'satcalc' | 'cloudflare' | 'saas' | 'ai') => void;
  onNewClaimModal?: () => void;
}

export default function DashboardOverview({
  claims,
  domains,
  onSelectClaim,
  onNavigateTab,
  onNewClaimModal
}: DashboardOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // React Query for live telemetry and asynchronous sync simulation
  const { data: telemetry, isLoading: isTelemetryLoading, refetch } = useQuery({
    queryKey: ['dashboard-telemetry'],
    queryFn: async () => {
      // Simulate real-time enclaves telemetry retrieval
      await new Promise((r) => setTimeout(r, 600));
      return {
        cloudEnclaveStatus: 'OPERATIONAL',
        edgeLatencyMs: 24,
        carrierAuditsPending: 3,
        lastSyncTimestamp: new Date().toLocaleTimeString(),
      };
    },
    refetchInterval: 30000,
  });

  // Calculate high-level financial metrics
  const totalOriginalRCV = claims.reduce((acc, c) => acc + c.initialEstimate, 0);
  const totalSupplementDelta = claims.reduce((acc, c) => acc + c.delta, 0);
  const totalRevisedRCV = totalOriginalRCV + totalSupplementDelta;
  const compliantClaimsCount = claims.filter(c => c.status === 'AUDITED_COMPLIANT' || c.status === 'PAID_SETTLED').length;
  const complianceRate = claims.length > 0 ? Math.round((compliantClaimsCount / claims.length) * 100) : 100;

  // Filter claims based on search and status
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch = 
      claim.homeowner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mock activity feed
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Forensic Supplement Approved',
      detail: '+$14,200 delta accepted by State Farm for Enitan property (IRC R905.2.8.2 compliant)',
      time: '12m ago',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      tag: 'FINANCIAL'
    },
    {
      id: 'act-2',
      title: 'SATCALC v2 Slope Scan Completed',
      detail: 'Aerial trig calculated 30.61 True Squares on 8/12 pitch for Oakridge residence',
      time: '45m ago',
      icon: <Calculator className="w-4 h-4 text-cyan-400" />,
      tag: 'TRIG'
    },
    {
      id: 'act-3',
      title: 'COC Settlement Package Generated',
      detail: 'Certificate of Completion issued with geocoded Class 3 IR photo audit',
      time: '2h ago',
      icon: <ShieldCheck className="w-4 h-4 text-teal-400" />,
      tag: 'LEGAL'
    },
    {
      id: 'act-4',
      title: 'Cloudflare Zero Trust Enclave Synced',
      detail: 'nimbusiq.ai and client headless routing verified with A+ SSL rating',
      time: '4h ago',
      icon: <Database className="w-4 h-4 text-blue-400" />,
      tag: 'INFRA'
    }
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Key Metrics Cards (4 Minimum) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Revised RCV */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/30 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Revised RCV Total</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            ${totalRevisedRCV.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 font-sans">
            <span className="text-emerald-400 font-mono font-bold">100% Insurer RCV</span>
            <span>&bull;</span>
            <span className="text-zinc-500">{claims.length} Active Files</span>
          </div>
        </div>

        {/* Metric 2: Supplement Delta Recovered */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/30 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Supplement Delta</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            +${totalSupplementDelta.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 font-sans">
            <span className="text-emerald-400 font-mono font-bold">+19.4% Avg Lift</span>
            <span>&bull;</span>
            <span className="text-zinc-500">Forensic Recovery</span>
          </div>
        </div>

        {/* Metric 3: SATCALC Scanned True Squares */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/30 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Scanned Geometry</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            3,842 <span className="text-sm font-sans text-blue-400 font-bold">SQ</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 font-sans">
            <span className="text-blue-400 font-mono font-bold">SATCALC v2</span>
            <span>&bull;</span>
            <span className="text-zinc-500">2D to 3D Slope Model</span>
          </div>
        </div>

        {/* Metric 4: Code Compliance Rate */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-teal-500/30 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/10 transition-all" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">IRC Compliance</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-teal-400 font-mono tracking-tight">
            {complianceRate}%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 font-sans">
            <span className="text-teal-400 font-mono font-bold">IRC R905.2.8.2</span>
            <span>&bull;</span>
            <span className="text-zinc-500">Zero Omissions</span>
          </div>
        </div>

      </div>

      {/* ── Quick Action Workflow Toolbar ── */}
      <div className="p-4 rounded-2xl bg-[#0c0c14]/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Quick Actions:
          </span>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">
            Sovereign Workflows
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('claims')}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-zinc-700/60"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit New Claim RCV</span>
          </button>
          
          <button
            onClick={() => onNavigateTab('satcalc')}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-zinc-700/60"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>Run SATCALC Trig Math</span>
          </button>

          <button
            onClick={() => onNavigateTab('cloudflare')}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-zinc-700/60"
          >
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Edge DNS Fleet</span>
          </button>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-zinc-800 cursor-pointer"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTelemetryLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Main Content Grid: Primary Data Table + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Claims Data Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0c0c14]/80 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md">
            
            {/* Table Header & Search/Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Claims Forensics & Reconciliation</span>
                  <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                    {filteredClaims.length} Records
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Inspect Revised RCV, supplement line-items, and carrier allocations
                </p>
              </div>

              {/* Search input */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search homeowner, carrier..."
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AUDITED_COMPLIANT">Audited Compliant</option>
                  <option value="SUPPLEMENT_PENDING">Supplement Pending</option>
                  <option value="PAID_SETTLED">Paid Settled</option>
                </select>
              </div>
            </div>

            {/* Primary Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-400 font-mono text-[11px] uppercase">
                    <th className="pb-3 font-semibold">Homeowner & File</th>
                    <th className="pb-3 font-semibold">Carrier</th>
                    <th className="pb-3 font-semibold text-right">Initial RCV</th>
                    <th className="pb-3 font-semibold text-right">Supplement Delta</th>
                    <th className="pb-3 font-semibold text-right">Revised RCV</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        <div className="max-w-xs mx-auto space-y-3">
                          <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                          <p className="text-sm font-semibold text-zinc-400">No matching claims found</p>
                          <p className="text-xs text-zinc-600">Try adjusting your search criteria or reset filters</p>
                          <button
                            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                            className="text-xs text-cyan-400 font-mono hover:underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <tr 
                        key={claim.id}
                        className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                        onClick={() => {
                          onSelectClaim(claim.id);
                          onNavigateTab('claims');
                        }}
                      >
                        <td className="py-3.5 pr-2">
                          <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {claim.homeowner}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {claim.location} &bull; {claim.pitch}
                          </div>
                        </td>

                        <td className="py-3.5 text-zinc-300 font-medium">
                          {claim.carrier}
                        </td>

                        <td className="py-3.5 text-right font-mono text-zinc-400">
                          ${claim.initialEstimate.toLocaleString()}
                        </td>

                        <td className="py-3.5 text-right font-mono font-bold text-emerald-400">
                          +${claim.delta.toLocaleString()}
                        </td>

                        <td className="py-3.5 text-right font-mono font-bold text-white">
                          ${(claim.initialEstimate + claim.delta).toLocaleString()}
                        </td>

                        <td className="py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                            claim.status === 'AUDITED_COMPLIANT'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : claim.status === 'PAID_SETTLED'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {claim.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectClaim(claim.id);
                              onNavigateTab('claims');
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-cyan-500 hover:text-black text-zinc-400 transition-all cursor-pointer"
                            title="Inspect Claim"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <div>
                Formula: <span className="text-zinc-300">Revised RCV = Initial Estimate + Forensic Delta</span>
              </div>
              <button
                onClick={() => onNavigateTab('claims')}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Claims View & COCs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Activity Feed & Telemetry (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live Enclave Telemetry Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Enclave Telemetry</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">
                {telemetry?.lastSyncTimestamp || 'Active'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-zinc-400">GCP Enclave</span>
                <span className="text-emerald-400 font-bold">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-zinc-400">Edge Round-Trip</span>
                <span className="text-cyan-400 font-bold">{telemetry?.edgeLatencyMs || 24}ms</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-zinc-400">IRC Verification</span>
                <span className="text-teal-400 font-bold">R905.2.8.2 ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audit Activity Stream</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">Real-Time</span>
            </div>

            <div className="space-y-3.5">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700/60 flex-shrink-0 mt-0.5">
                    {act.icon}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{act.title}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{act.time}</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">{act.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800/60">
              <button
                onClick={() => onNavigateTab('ai')}
                className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Co-Pilot Log Audit</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
