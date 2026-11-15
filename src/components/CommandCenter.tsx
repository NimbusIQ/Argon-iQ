import React, { useState } from 'react';
import { 
  Shield, Server, Activity, Globe, Key, AlertCircle, 
  Settings, CheckCircle, RefreshCw, UserCheck, HelpCircle,
  Layout, Cpu, Database, Eye, Terminal, Lock, Play, Copy 
} from 'lucide-react';
import { INITIAL_DOMAINS, INITIAL_CLOUDFLARE } from '../data';
import { DomainMetric, CloudflareState } from '../types';

interface CommandCenterProps {
  domains?: DomainMetric[];
  onUpdateDomains?: (updated: DomainMetric[]) => void;
}

export default function CommandCenter({ domains: propDomains, onUpdateDomains }: CommandCenterProps = {}) {
  const [localDomains, setLocalDomains] = useState<DomainMetric[]>(INITIAL_DOMAINS);
  const domains = propDomains || localDomains;
  const setDomainsInternal = onUpdateDomains || setLocalDomains;

  const [cloudflareState, setCloudflareState] = useState<CloudflareState>(INITIAL_CLOUDFLARE);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState<boolean>(false);
  const [hasLoadedPerformance, setHasLoadedPerformance] = useState<boolean>(false);
  const [connectionSpeed, setConnectionSpeed] = useState<string>('Unable to load data');
  const [customDomainName, setCustomDomainName] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Toggle Agent Lee permission state
  const toggleAgentLee = () => {
    setCloudflareState(prev => ({
      ...prev,
      agentLeeEnabled: !prev.agentLeeEnabled
    }));
  };

  const loadPerformanceData = () => {
    setIsLoadingPerformance(true);
    setTimeout(() => {
      setConnectionSpeed('45ms (Optimal)');
      setCloudflareState(prev => ({
        ...prev,
        cacheRate: '25.3%'
      }));
      setHasLoadedPerformance(true);
      setIsLoadingPerformance(false);
    }, 1200);
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomainName) return;
    
    const newDomain: DomainMetric = {
      name: customDomainName.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, ''),
      traffic: `${(Math.random() * 3 + 1).toFixed(1)}K`,
      cacheRate: `${(Math.random() * 20 + 5).toFixed(1)}%`,
      status: 'Active',
      sslGrade: 'A+'
    };

    setDomainsInternal([...domains, newDomain]);
    setCustomDomainName('');
  };

  const copyTokenToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = cloudflareState.agentLeeToken;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans animate-[fadeIn_0.4s_ease-out]">
      
      {/* Sidebar navigation list */}
      <nav className="lg:col-span-3 bg-[#0a0a0f] border border-white/5 p-5 rounded-3xl space-y-6 self-start text-slate-400">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white font-extrabold text-sm uppercase">
            <span className="p-1 bg-cyan-500 rounded text-slate-950 font-black text-[10px]">CF</span>
            <span>Nimbus IQ Ai, LLC</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider mt-0.5">Cloudflare Edge Portal</span>
        </div>

        <div className="space-y-2">
          <span className="text-[9px] font-mono text-slate-600 block uppercase tracking-wider font-extrabold">OVERVIEW</span>
          <button className="w-full text-left py-1.5 px-3 bg-cyan-500/10 text-cyan-400 rounded-lg font-bold flex items-center justify-between">
            <span>Account home</span>
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          </button>
          <button className="w-full text-left py-1.5 px-3 hover:text-white transition-all block">Recents</button>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-mono text-slate-600 block uppercase tracking-wider font-extrabold">DOMAINS</span>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-500" /> Observe
          </button>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-slate-500" /> Investigate
          </button>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-slate-500" /> Analytics
          </button>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-mono text-slate-600 block uppercase tracking-wider font-extrabold">DEVELOPERS</span>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-slate-500" /> Build
          </button>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-500" /> Compute
          </button>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-slate-500" /> AI
          </button>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-slate-500" /> Storage & databases
          </button>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-mono text-slate-600 block uppercase tracking-wider font-extrabold">PROTECT & CONNECT</span>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500" /> Application security
          </button>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2 text-cyan-400 font-bold">
            <Server className="w-3.5 h-3.5 text-cyan-400" /> Zero Trust
          </button>
          <button className="w-full text-left py-1 px-3 hover:text-white transition-all flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-500" /> Networking
          </button>
        </div>
      </nav>

      {/* Main Grid Content Area */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Real-time sync alert */}
        <div className="p-4 bg-[#0a0a0f] border border-white/5 rounded-3xl flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Activity className="text-cyan-400 w-4 h-4 animate-pulse" />
            <div>
              <span className="text-white font-bold block">Nimbus IQ Ai, LLC Account Home</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Synchronizing real-time analytics across multiple client domains</span>
            </div>
          </div>
          <button 
            onClick={loadPerformanceData}
            disabled={isLoadingPerformance}
            className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold font-mono text-[10px] rounded-xl hover:bg-cyan-400 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {isLoadingPerformance ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Sync Metrics
          </button>
        </div>

        {/* Cloudflare Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Analytics Column */}
          <div className="bg-[#0c0c12]/60 border border-white/5 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">Analytics</h4>
            
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Security Insights</span>
                <span className="text-xl font-bold text-white font-mono mt-0.5 block">12 Threats</span>
                <span className="text-[10px] text-red-400 block mt-0.5">2 High, 10 Low</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Logins Blocked</span>
                <span className="text-xl font-bold text-slate-400 font-mono mt-0.5 block">0</span>
              </div>
            </div>
          </div>

          {/* Performance Column */}
          <div className="bg-[#0c0c12]/60 border border-white/5 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">Performance</h4>
            
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Cache Rate</span>
                <span className="text-xl font-bold text-white font-mono mt-0.5 block">{cloudflareState.cacheRate}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Global Edge Optimizations</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Connection Speed</span>
                {connectionSpeed === 'Unable to load data' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-yellow-500">{connectionSpeed}</span>
                    <button 
                      onClick={loadPerformanceData}
                      className="text-[10px] text-cyan-400 hover:underline font-mono"
                    >
                      (Load)
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 font-bold block mt-1">{connectionSpeed}</span>
                )}
              </div>
            </div>
          </div>

          {/* Activity Column */}
          <div className="bg-[#0c0c12]/60 border border-white/5 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">Activity</h4>
            
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Web Traffic (Hits)</span>
                <span className="text-xl font-bold text-cyan-400 font-mono mt-0.5 block">4.01k</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Edge nodes resolved</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">App Logins</span>
                <span className="text-xl font-bold text-slate-400 font-mono mt-0.5 block">{cloudflareState.appLogins}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Domains List */}
        <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Domains ({domains.length})</h4>
              <p className="text-[9px] text-slate-500 font-mono">Managed under Cloudflare Enterprise subscription</p>
            </div>
            {/* Quick add form */}
            <form onSubmit={handleAddDomain} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="domain.com"
                value={customDomainName}
                onChange={(e) => setCustomDomainName(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none text-[11px] font-mono focus:border-cyan-400 w-36"
              />
              <button 
                type="submit"
                className="px-3 py-1 bg-slate-900 border border-white/10 hover:border-cyan-500/20 text-slate-300 font-mono rounded-xl font-bold text-[10px]"
              >
                + Add
              </button>
            </form>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {domains.map((dom) => (
              <div key={dom.name} className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="font-bold text-white tracking-tight">{dom.name}</span>
                </div>
                <div className="flex gap-6 text-[11px] text-slate-500">
                  <div>
                    <span className="text-[9px] block">TRAFFIC</span>
                    <span className="text-slate-300 block font-bold">{dom.traffic}</span>
                  </div>
                  <div>
                    <span className="text-[9px] block">CACHE</span>
                    <span className="text-slate-300 block font-bold">{dom.cacheRate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] block">SSL</span>
                    <span className="text-emerald-400 block font-bold">{dom.sslGrade}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Lee Access Panel */}
        <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Key className="text-yellow-400 w-4 h-4 animate-pulse" />
                Enable Agent Lee Access
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                Agent Lee requires a read-only API token to coordinate live meteorological audits and storm damage scans.
              </p>
            </div>
            
            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase">OFF</span>
              <button
                onClick={toggleAgentLee}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                  cloudflareState.agentLeeEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div className={`bg-slate-950 w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  cloudflareState.agentLeeEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">ON</span>
            </div>
          </div>

          {cloudflareState.agentLeeEnabled && (
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 text-slate-300 rounded-2xl space-y-3 font-mono text-[11px] animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Agent Lee Integration Active</span>
              </div>
              <p className="text-slate-400 leading-relaxed font-sans">
                A read-only API access token has been generated and mounted. The agent is now authorized to monitor real-time security logs and crawl weather trends.
              </p>
              <div className="flex items-center justify-between bg-slate-950 border border-white/5 p-2.5 rounded-xl">
                <span className="text-slate-400 font-bold select-all truncate max-w-[320px]">
                  {cloudflareState.agentLeeToken}
                </span>
                <button
                  onClick={copyTokenToClipboard}
                  className="px-3 py-1 bg-slate-900 border border-white/10 hover:border-cyan-500/20 text-slate-300 hover:text-white rounded-lg flex items-center gap-1 transition-all"
                >
                  {copiedToken ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zero Trust, DNS & Tunnels Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0c0c12]/60 border border-white/5 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">Zero Trust Security</h4>
            
            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">USED / TOTAL SEATS:</span>
                <span className="text-white font-bold">0 / 1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ACCESS CONTROLS APPLICATIONS:</span>
                <span className="text-white font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CLOUD AND SAAS FINDINGS:</span>
                <span className="text-white font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNS POLICIES:</span>
                <span className="text-white font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TUNNELS ACTIVE:</span>
                <span className="text-cyan-400 font-bold">{cloudflareState.tunnelsActive}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0c0c12]/60 border border-white/5 p-5 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">Next Steps</h4>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <span>Enable single sign-on to improve login security</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <span>Invite teammates and back-up administrators</span>
                </li>
              </ul>
            </div>

            <div className="text-[10px] text-slate-500 font-mono uppercase flex justify-between pt-2 border-t border-white/5">
              <span>SYSTEM STATUS: STABLE</span>
              <span>VERSION: CF-6.0</span>
            </div>
          </div>
        </div>

        {/* Footer info mimicking requested items */}
        <div className="pt-6 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 text-[10px] text-slate-500 font-mono uppercase">
          <span>&copy; 2026 Cloudflare, Inc. • nimbusiq.ai</span>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Terms of Use</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Security Issues</span>
          </div>
        </div>

      </div>
    </div>
  );
}
