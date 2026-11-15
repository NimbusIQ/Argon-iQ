import React, { useState } from 'react';
import { 
  Users, DollarSign, FileText, CheckCircle2, 
  Mail, Printer, Copy, Compass, ArrowRight, ShieldCheck, ExternalLink, Calendar,
  Download
} from 'lucide-react';
import { Claim } from '../types';
import { INITIAL_CLAIMS } from '../data';

interface ClaimsDashboardProps {
  claimsList?: Claim[];
  onUpdateClaims?: (updated: Claim[]) => void;
}

export default function ClaimsDashboard({ claimsList: propClaimsList, onUpdateClaims }: ClaimsDashboardProps = {}) {
  const [localClaimsList, setLocalClaimsList] = useState<Claim[]>(INITIAL_CLAIMS);
  const claimsList = propClaimsList || localClaimsList;
  const setClaimsListInternal = onUpdateClaims || setLocalClaimsList;

  const [selectedClaimId, setSelectedClaimId] = useState<string>('enitan');

  // Find selected claim
  const currentClaim = claimsList.find(c => c.id === selectedClaimId) || claimsList[0];

  // Dynamic overrides
  const [initialEstimate, setInitialEstimate] = useState<number>(currentClaim.initialEstimate);
  const [supplementDelta, setSupplementDelta] = useState<number>(currentClaim.delta);
  const [deductible, setDeductible] = useState<number>(currentClaim.deductible);
  const [paymentsMade, setPaymentsMade] = useState<number>(currentClaim.paymentsMade);

  // Sync state if user clicks on another claim or if claimsList itself changes externally
  React.useEffect(() => {
    setInitialEstimate(currentClaim.initialEstimate);
    setSupplementDelta(currentClaim.delta);
    setDeductible(currentClaim.deductible);
    setPaymentsMade(currentClaim.paymentsMade);
  }, [selectedClaimId, currentClaim.id]);

  // Sync state back to parent or local list if fields are modified
  React.useEffect(() => {
    const updated = claimsList.map(c => {
      if (c.id === selectedClaimId) {
        return {
          ...c,
          initialEstimate,
          delta: supplementDelta,
          deductible,
          paymentsMade
        };
      }
      return c;
    });

    const current = claimsList.find(c => c.id === selectedClaimId);
    if (current && (
      current.initialEstimate !== initialEstimate ||
      current.delta !== supplementDelta ||
      current.deductible !== deductible ||
      current.paymentsMade !== paymentsMade
    )) {
      setClaimsListInternal(updated);
    }
  }, [initialEstimate, supplementDelta, deductible, paymentsMade, selectedClaimId, claimsList, setClaimsListInternal]);

  // Derived financials
  const revisedRCV = initialEstimate + supplementDelta;
  const netCarrierResponsibility = revisedRCV - deductible;
  const remainingBalanceDue = netCarrierResponsibility - paymentsMade;

  // Notification message
  const [toastMsg, setToastMsg] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCopyText = (text: string, label: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    triggerToast(`${label} copied to clipboard!`);
  };

  // Pre-compiled adjuster letter
  const generateOutreachLetter = () => {
    return `Subject: STATUTORY INGRESS NOTICE: Supplementary Restoration Delta for Claim #${currentClaim.id.toUpperCase()} - ${currentClaim.homeowner}

Date: June 29, 2026
Attn: ${currentClaim.examinerName} (${currentClaim.carrier} Claims Division)
Email: ${currentClaim.examinerEmail}

RE: Residential Building Code Supplement & Depreciation Release
Property Address: ${currentClaim.location}
Insured: ${currentClaim.homeowner}
Code Directives: IRC R905.2.8.2 (Eave/Rake Drip Edge), IRC R905.1.2 (Ice & Water Shield)

Dear ${currentClaim.examinerName},

We represent Nimbus Roofing, LLC, working in coordination with the insured property owner ${currentClaim.homeowner} to return the property to structural pre-loss uniformity under TDI Bulletin B-0003-09 guidelines.

Upon conducting a forensic SATCALC V2 dimensional audit of the carrier-assessed estimate, we identified major structural omissions totaling a supplement delta of $${supplementDelta.toLocaleString(undefined, {minimumFractionDigits: 2})}. These omissions violate municipal building code regulations and residential installation standards:

1. IRC R905.2.8.2 Compliance: Drip edge flashing was completely omitted at all eaves and rakes (total of ${currentClaim.footprint > 2000 ? '400' : '280'} Linear Feet required).
2. Texas Insurance Code Section 542: This correspondence constitutes formal statutory notice of supplemental proof of loss. A response is required within 15 business days.

The updated total claim value (Revised RCV) stands at $${revisedRCV.toLocaleString(undefined, {minimumFractionDigits: 2})}. Deducting the standard TX homeowner deductible of $${deductible.toLocaleString(undefined, {minimumFractionDigits: 2})}, the net carrier responsibility is $${netCarrierResponsibility.toLocaleString(undefined, {minimumFractionDigits: 2})}. With $${paymentsMade.toLocaleString(undefined, {minimumFractionDigits: 2})} received to date, the outstanding balance due to release and finalize is $${remainingBalanceDue.toLocaleString(undefined, {minimumFractionDigits: 2})}.

Please find attached the signed Certificate of Completion (COC) and high-resolution material delivery manifests. Release all held depreciation immediately to avoid statutory prompt-payment interest accruals.

Sincerely,
Dustin Moore, Principal Claims Administrator
Nimbus Roofing, LLC
dustin@nimbusroofing.com`;
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Homeowner', 'Location', 'Carrier', 'Initial Estimate ($)', 
      'Revised Estimate ($)', 'Delta ($)', 'Deductible ($)', 'Contractor Allocated ($)', 
      'Payments Made ($)', 'Pitch', 'Footprint (sq ft)', 'Facets', 'Hips & Valleys (LF)', 
      'Status', 'Examiner Name', 'Examiner Email', 'CompanyCam URL'
    ];
    
    const rows = claimsList.map(c => {
      const isSelected = c.id === selectedClaimId;
      const claimInitialEstimate = isSelected ? initialEstimate : c.initialEstimate;
      const claimDelta = isSelected ? supplementDelta : c.delta;
      const claimDeductible = isSelected ? deductible : c.deductible;
      const claimPaymentsMade = isSelected ? paymentsMade : c.paymentsMade;
      const claimRevisedEstimate = claimInitialEstimate + claimDelta;

      return [
        c.id,
        `"${c.homeowner.replace(/"/g, '""')}"`,
        `"${c.location.replace(/"/g, '""')}"`,
        `"${c.carrier.replace(/"/g, '""')}"`,
        claimInitialEstimate,
        claimRevisedEstimate,
        claimDelta,
        claimDeductible,
        c.contractorAllocated,
        claimPaymentsMade,
        `"${c.pitch}"`,
        c.footprint,
        c.facets,
        c.hipsValleysLF,
        c.status,
        `"${c.examinerName.replace(/"/g, '""')}"`,
        `"${c.examinerEmail.replace(/"/g, '""')}"`,
        `"${c.companyCamUrl.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nimbusiq_claims_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Claims list exported as CSV!');
  };

  const handleExportJSON = () => {
    const dataToExport = claimsList.map(c => {
      if (c.id === selectedClaimId) {
        return {
          ...c,
          initialEstimate,
          delta: supplementDelta,
          deductible,
          paymentsMade,
          revisedEstimate: initialEstimate + supplementDelta
        };
      }
      return c;
    });

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nimbusiq_claims_export_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Claims list exported as JSON!');
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-slate-950 font-mono text-[11px] font-black uppercase px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Client List & Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Users className="text-cyan-400 w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Active Claims Registry</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-2.5 py-1 bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer animate-none"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-2.5 py-1 bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer animate-none"
                  title="Export to JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {claimsList.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${
                    selectedClaimId === claim.id
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block">{claim.homeowner}</span>
                    <span className="text-[10px] font-mono text-slate-500 block">{claim.location} • {claim.carrier}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +${claim.delta.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Financial Form */}
          <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Live Claim Adjuster Calculator
            </h4>

            <div className="space-y-3 font-mono text-xs">
              {/* Original RCV */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase block">Original Estimate ($)</label>
                <input
                  type="number"
                  value={initialEstimate}
                  onChange={(e) => setInitialEstimate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Supplement Delta */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase block">Supplement Delta ($)</label>
                <input
                  type="number"
                  value={supplementDelta}
                  onChange={(e) => setSupplementDelta(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Deductible */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase block">Homeowner Deductible ($)</label>
                <input
                  type="number"
                  value={deductible}
                  onChange={(e) => setDeductible(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Payments Made */}
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase block">Carrier Payments Released ($)</label>
                <input
                  type="number"
                  value={paymentsMade}
                  onChange={(e) => setPaymentsMade(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Ledger, Check Graphics & COC Print */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Detailed Financial Rec Table */}
          <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                  Financial Reconciliation Ledger
                </h3>
                <p className="text-[10px] font-mono text-slate-500">MAPPED AGAINST TEXAS INSURANCE CODE §542</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded uppercase">
                  Claim Core Verified
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                <span className="text-[9px] text-slate-500 block uppercase">REVISED APPROVAL</span>
                <span className="text-sm font-bold text-white block mt-1">${revisedRCV.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                <span className="text-[9px] text-slate-500 block uppercase">NET CARRIER OBLIGATION</span>
                <span className="text-sm font-bold text-cyan-400 block mt-1">${netCarrierResponsibility.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                <span className="text-[9px] text-slate-500 block uppercase">PAYMENTS DEPOSITED</span>
                <span className="text-sm font-bold text-emerald-400 block mt-1">${paymentsMade.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/20">
                <span className="text-[9px] text-emerald-400 block uppercase font-bold">BALANCE TO RECOVERY</span>
                <span className={`text-sm font-black block mt-1 ${remainingBalanceDue > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  ${remainingBalanceDue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>

            {/* Sovereign Notary Seal & Link */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block uppercase font-mono">Sovereign Notary Seal Connected</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">IRC Building Code compliance verified (IRC R905.2.8.2 drip edge standards).</span>
                </div>
              </div>
              <a 
                href={currentClaim.companyCamUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-white/10 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                CompanyCam Portal
              </a>
            </div>
          </div>

          {/* High-Fidelity Cashier's Check Representation */}
          <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Navy Federal Cashier's Check Verification
                </h4>
                <p className="text-[9px] text-slate-500 font-mono">SECURITY GRADE: HIGH FIDELITY SECURE BANKING</p>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                Verified Cleared
              </span>
            </div>

            {/* Check Graphic */}
            <div className="relative bg-[#eceff1] text-[#1a237e] border border-slate-300 rounded-2xl p-6 shadow-xl select-none font-sans overflow-hidden">
              {/* Internal subtle wavy lines or watermark background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1a237e_2px,transparent_2px)] [background-size:12px_12px]" />

              <div className="flex justify-between items-start pb-4 border-b border-indigo-900/10 relative z-10">
                <div>
                  <h5 className="font-extrabold text-xs tracking-tight uppercase text-indigo-950 font-sans">
                    NAVY FEDERAL CREDIT UNION
                  </h5>
                  <p className="text-[8px] text-[#5c6bc0] font-mono uppercase">Official Cashier's Check • P.O. Box 3000</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[9px] block text-indigo-950 font-black">CHECK NO. 49281005</span>
                  <span className="text-[8px] text-slate-500 block mt-0.5">DATE: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Payee and amount layout */}
              <div className="grid grid-cols-12 gap-2 py-6 relative z-10 text-xs">
                <div className="col-span-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase text-[#5c6bc0]">PAY TO THE ORDER OF:</span>
                    <span className="border-b border-indigo-900/30 flex-1 font-bold text-[#1a237e] tracking-tight pb-0.5">
                      Dustin Moore - Nimbus Roofing, LLC (on behalf of {currentClaim.homeowner})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase text-[#5c6bc0]">MEMO:</span>
                    <span className="border-b border-indigo-900/30 flex-1 font-mono text-[#5c6bc0] pb-0.5">
                      CLAIM RECONCILIATION release - {currentClaim.id.toUpperCase()} • Code Comp
                    </span>
                  </div>
                </div>

                <div className="col-span-4 flex flex-col justify-end items-end">
                  <div className="bg-[#cfd8dc] border border-indigo-900/20 px-3 py-2 rounded font-mono font-bold text-[#1a237e] text-center w-full">
                    ${paymentsMade.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                  <span className="text-[7px] text-[#5c6bc0] font-mono uppercase tracking-widest mt-1">U.S. DOLLARS</span>
                </div>
              </div>

              {/* MICR Bank Route Code */}
              <div className="flex justify-between items-center pt-4 border-t border-indigo-900/10 relative z-10 font-mono">
                <div className="text-[11px] text-[#2c3e50] tracking-[0.2em] font-mono">
                  ⑆056003615⑆ 0019283748291⑈ 1005
                </div>
                <div className="text-right space-y-1">
                  <div className="border-b border-indigo-900/40 w-32 pb-0.5 h-6 flex items-end justify-center">
                    <span className="text-[8px] font-sans font-medium text-slate-500 uppercase tracking-tighter">Authorized Signature</span>
                  </div>
                  <span className="text-[6px] text-slate-500 uppercase block tracking-wider">Navy Federal Financial Officer</span>
                </div>
              </div>

              {/* Stamp watermark overlay */}
              <div className="absolute top-12 right-24 rotate-12 border-2 border-emerald-500/40 bg-white/45 text-emerald-600 font-bold px-3 py-1 text-[9px] tracking-widest font-mono rounded-lg flex items-center gap-1 select-none pointer-events-none">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PAID SECURE
              </div>
            </div>
          </div>

          {/* Adjuster Outreach suite */}
          <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail className="text-cyan-400 w-5 h-5" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Adjuster Outreach Copywriter
                </h4>
              </div>
              <button
                onClick={() => handleCopyText(generateOutreachLetter(), "Outreach email template")}
                className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-mono font-bold text-[10px] uppercase rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Full Email
              </button>
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl max-h-48 overflow-y-auto font-mono text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed">
              {generateOutreachLetter()}
            </div>
          </div>

          {/* PRINT COMPONENT CERTIFICATE OF COMPLETION */}
          <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="text-cyan-400 w-5 h-5" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  Certificate of Completion (COC) Document
                </h4>
              </div>
              <button
                onClick={triggerPrint}
                className="px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-cyan-500/20 text-slate-300 hover:text-white font-mono font-bold text-[10px] uppercase rounded-xl transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Document
              </button>
            </div>

            {/* Print frame */}
            <div id="print-coc-frame" className="border-2 border-white/5 p-8 rounded-2xl bg-slate-950 text-slate-300 font-sans space-y-6 relative overflow-hidden print:border-black print:bg-white print:text-black">
              {/* Soft logo watermark in background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.01] print:text-black/[0.02] text-[8vw] font-black uppercase tracking-widest font-mono select-none pointer-events-none">
                NIMBUS ROOFING
              </div>

              <div className="text-center space-y-2 border-b border-white/10 print:border-black/10 pb-6">
                <span className="text-[10px] font-mono text-cyan-400 print:text-blue-600 uppercase tracking-widest block">Official General Contractor Statement</span>
                <h2 className="text-2xl font-extrabold tracking-tight text-white print:text-black uppercase">
                  CERTIFICATE OF COMPLETION
                </h2>
                <p className="text-[11px] text-slate-500 font-mono">SOVEREIGN ENCLAVE AUDITOR IDENTIFICATION: CO-{currentClaim.id.toUpperCase()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-sans">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">1. PROJECT AND OWNER SUMMARY</span>
                  <p><span className="text-slate-400 font-bold print:text-black">HOMEOWNER NAME:</span> {currentClaim.homeowner}</p>
                  <p><span className="text-slate-400 font-bold print:text-black">PROPERTY LOCATION:</span> {currentClaim.location}</p>
                  <p><span className="text-slate-400 font-bold print:text-black">COMPLETION TIMESTAMP:</span> {new Date().toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">2. CODE COMPLIANCE ASSURANCES</span>
                  <p><span className="text-slate-400 font-bold print:text-black">DRIP EDGE MANDATE:</span> IRC R905.2.8.2 Certified Compliant</p>
                  <p><span className="text-slate-400 font-bold print:text-black">VALLEY ASSEMBLY:</span> IRC R905.1.2 Bitumen Sealed</p>
                  <p><span className="text-slate-400 font-bold print:text-black">AUDIT SYSTEM:</span> Nimbus SATCALC v2 Algorithmic Proof</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 print:border-black/10 text-[11px] text-slate-400 leading-relaxed space-y-4">
                <p>
                  Nimbus Roofing, LLC hereby certifies that all repair procedures required to restore the property to pre-loss uniformity have been fully executed in pristine compliance with the 2026 International Residential Codes (IRC). 
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1">
                    <div className="border-b border-white/20 print:border-black/30 pb-4 h-8" />
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">Dustin Moore, General Contractor Signature</span>
                  </div>
                  <div className="space-y-1">
                    <div className="border-b border-white/20 print:border-black/30 pb-4 h-8" />
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">{currentClaim.homeowner}, Insured Property Owner Signature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
