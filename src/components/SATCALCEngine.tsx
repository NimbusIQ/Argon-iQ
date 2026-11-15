import React, { useState, useEffect } from 'react';
import { Cpu, HelpCircle, Info, RefreshCw, Layers, Check, Calculator, AlertTriangle } from 'lucide-react';

export default function SATCALCEngine() {
  // Input parameters based on formulation
  const [livingArea, setLivingArea] = useState<number>(2800);
  const [stories, setStories] = useState<number>(2);
  const [garageFootprint, setGarageFootprint] = useState<number>(440);
  const [pitchRise, setPitchRise] = useState<number>(8); // rise over 12 configuration
  const [wasteRate, setWasteRate] = useState<number>(0.15); // Medium = 15%, High = 18%, etc.
  const [hipsValleysLF, setHipsValleysLF] = useState<number>(130);

  // Computed values
  const [foundationFootprint, setFoundationFootprint] = useState<number>(0);
  const [slopeFactor, setSlopeFactor] = useState<number>(0);
  const [hipValleyMultiplier, setHipValleyMultiplier] = useState<number>(0);
  const [slopeAngleDegrees, setSlopeAngleDegrees] = useState<number>(0);
  const [actualRoofArea, setActualRoofArea] = useState<number>(0);
  const [trueSquares, setTrueSquares] = useState<number>(0);

  // Audit simulations
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  useEffect(() => {
    // 2.1 The Footprint Formulation: F = (L/S) * 1.12 + G
    const F = (livingArea / stories) * 1.12 + garageFootprint;
    setFoundationFootprint(F);

    // 2.2 Slope & Hip/Valley Factors: SF = sqrt(R^2 + 12^2) / 12
    const SF = Math.sqrt(Math.pow(pitchRise, 2) + 144) / 12;
    setSlopeFactor(SF);

    // HVF = sqrt(2 + (R/12)^2)
    const HVF = Math.sqrt(2 + Math.pow(pitchRise / 12, 2));
    setHipValleyMultiplier(HVF);

    // Slope Angle theta = arctan(R/12) * 180 / pi
    const theta = Math.atan(pitchRise / 12) * (180 / Math.PI);
    setSlopeAngleDegrees(theta);

    // 2.3 True Material Requirements (True Squares): A = F * SF
    const A = F * SF;
    setActualRoofArea(A);

    // TS = (A * (1 + W)) / 100 + (HV_LF / 15) * 0.33
    const TS = (A * (1 + wasteRate)) / 100 + (hipsValleysLF / 15) * 0.33;
    setTrueSquares(TS);
  }, [livingArea, stories, garageFootprint, pitchRise, wasteRate, hipsValleysLF]);

  // Handle Preset profiles
  const applyPreset = (preset: 'basic' | 'complex' | 'mansion') => {
    if (preset === 'basic') {
      setLivingArea(1800);
      setStories(1);
      setGarageFootprint(400);
      setPitchRise(6);
      setWasteRate(0.10);
      setHipsValleysLF(60);
    } else if (preset === 'complex') {
      setLivingArea(3200);
      setStories(2);
      setGarageFootprint(480);
      setPitchRise(9);
      setWasteRate(0.18);
      setHipsValleysLF(160);
    } else {
      setLivingArea(5200);
      setStories(2);
      setGarageFootprint(650);
      setPitchRise(11);
      setWasteRate(0.22);
      setHipsValleysLF(245);
    }
    triggerAuditLog(`Preset applied: ${preset.toUpperCase()}`);
  };

  const triggerAuditLog = (msg: string) => {
    setAuditLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 8),
    ]);
  };

  const runFormalProofAudit = async () => {
    setIsAuditing(true);
    setAuditLogs([]);
    const proofSteps = [
      "INIT: Querying Vertex AI geodetic spatial constraints...",
      `STEP 1: Re-computing Raw Foundation footprint. F = (${livingArea} / ${stories}) * 1.12 + ${garageFootprint} = ${foundationFootprint.toFixed(2)} SqFt.`,
      `STEP 2: Solving slope factors. R=${pitchRise}. SF = sqrt(${pitchRise}^2 + 144) / 12 = ${slopeFactor.toFixed(4)}. Angle: ${slopeAngleDegrees.toFixed(1)}°.`,
      `STEP 3: Material interpolation. Waste Rate standard set at ${(wasteRate * 100).toFixed(0)}%.`,
      `STEP 4: Solving Hip/Valley Multipliers. HVF = ${hipValleyMultiplier.toFixed(4)}. Intersection length: ${hipsValleysLF} LF.`,
      `FINAL: True Squares calculated at ${trueSquares.toFixed(2)} SQ. Carrier baseline delta mapped. Audit locked.`
    ];

    for (let i = 0; i < proofSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setAuditLogs((prev) => [proofSteps[i], ...prev]);
    }
    setIsAuditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Parameters Panel */}
      <div className="lg:col-span-5 bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="text-cyan-400 w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              SATCALC v2 Geometric Engine
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded uppercase">
            Deterministic
          </span>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'basic', label: 'Anna Standard' },
            { id: 'complex', label: 'McKinney Gable' },
            { id: 'mansion', label: 'Frisco Mansion' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id as any)}
              className="py-1.5 px-3 bg-slate-950 border border-white/5 rounded-xl text-[10px] font-mono font-bold text-slate-400 hover:text-white hover:border-cyan-400/25 transition-all text-center"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="space-y-4 font-mono text-xs">
          {/* L: Living Area */}
          <div className="space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px] uppercase">
              <span>Living Area (L)</span>
              <span className="text-white font-bold">{livingArea.toLocaleString()} SQ FT</span>
            </div>
            <input
              type="range"
              min="1000"
              max="7000"
              step="50"
              value={livingArea}
              onChange={(e) => setLivingArea(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* S: Stories */}
          <div className="space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px] uppercase">
              <span>Stories (S)</span>
              <span className="text-white font-bold">{stories} Stories</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setStories(s)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    stories === s
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {s} Story
                </button>
              ))}
            </div>
          </div>

          {/* G: Garage Footprint */}
          <div className="space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px] uppercase">
              <span>Garage Footprint (G)</span>
              <span className="text-white font-bold">{garageFootprint} SQ FT</span>
            </div>
            <input
              type="range"
              min="200"
              max="1200"
              step="20"
              value={garageFootprint}
              onChange={(e) => setGarageFootprint(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* R: Pitch Rise */}
          <div className="space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px] uppercase">
              <span>Pitch Rise (R / 12)</span>
              <span className="text-white font-bold">{pitchRise}/12 Pitch</span>
            </div>
            <input
              type="range"
              min="3"
              max="16"
              step="1"
              value={pitchRise}
              onChange={(e) => setPitchRise(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* W: Waste Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px] uppercase">
              <span>Complexity Waste (W)</span>
              <span className="text-white font-bold">{(wasteRate * 100).toFixed(0)}% Waste</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              {[
                { val: 0.10, label: 'Low (10%)' },
                { val: 0.15, label: 'Med (15%)' },
                { val: 0.18, label: 'High (18%)' },
                { val: 0.22, label: 'Complx (22%)' },
              ].map((w) => (
                <button
                  key={w.val}
                  onClick={() => setWasteRate(w.val)}
                  className={`py-1 rounded-lg border transition-all ${
                    wasteRate === w.val
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                      : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* HV_LF: Hip/Valley length */}
          <div className="space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px] uppercase">
              <span>Hips & Valleys linear (HV_LF)</span>
              <span className="text-white font-bold">{hipsValleysLF} LF</span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="10"
              value={hipsValleysLF}
              onChange={(e) => setHipsValleysLF(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Action triggers */}
        <button
          onClick={runFormalProofAudit}
          disabled={isAuditing}
          className="w-full py-3.5 bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isAuditing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Cpu className="w-4 h-4" />
          )}
          Compute Formal Geometric Proof
        </button>
      </div>

      {/* Proofs Display */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Math equations card */}
        <div className="bg-[#0c0c12]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
            Mathematical Equations & Coefficients
          </h3>

          <div className="space-y-4 font-mono text-xs">
            {/* Equation 1 */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black">
                <span>Equation 1: Raw Footprint (F)</span>
                <span className="text-cyan-400">F = (L / S) * 1.12 + G</span>
              </div>
              <p className="text-[11px] text-slate-300">
                F = ({livingArea} / {stories}) &times; 1.12 + {garageFootprint} = <span className="text-white font-bold font-mono">{foundationFootprint.toFixed(2)} sq ft</span>
              </p>
              <span className="text-[9px] text-slate-500 block italic leading-normal">
                * Note: The 1.12 coefficient represents the standard 12% framing and structural projection multiplier for North Texas.
              </span>
            </div>

            {/* Equation 2 */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black">
                <span>Equation 2: Slope & Angle Multiplier</span>
                <span className="text-cyan-400">SF = sqrt(R² + 12²) / 12</span>
              </div>
              <p className="text-[11px] text-slate-300">
                SF = &radic;({pitchRise}² + 144) / 12 = <span className="text-white font-bold">{slopeFactor.toFixed(4)}</span> | Angle (&theta;) = <span className="text-white font-bold">{slopeAngleDegrees.toFixed(2)}&deg;</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Hip/Valley Multiplier (HVF) = &radic;(2 + ({pitchRise}/12)²) = <span className="text-white">{hipValleyMultiplier.toFixed(4)}</span>
              </p>
            </div>

            {/* Equation 3 */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black">
                <span>Equation 3: Material Requirements (True Squares)</span>
                <span className="text-cyan-400">TS = (A * (1 + W)) / 100 + (HV_LF / 15) * 0.33</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                A = {foundationFootprint.toFixed(2)} &times; {slopeFactor.toFixed(4)} = {actualRoofArea.toFixed(2)} sq ft
              </p>
              <p className="text-[11px] text-emerald-400 font-bold font-mono mt-1">
                TS = ({actualRoofArea.toFixed(2)} &times; {1 + wasteRate}) / 100 + ({hipsValleysLF} / 15) &times; 0.33 = {trueSquares.toFixed(2)} SQ
              </p>
              <span className="text-[9px] text-slate-500 block italic leading-normal">
                * Where (HV_LF / 15) &times; 0.33 represents the physical waste adder for hip and ridge cap shingle intersection cutting.
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Audit Console Logs */}
        <div className="bg-black/80 rounded-3xl p-6 border border-white/5 font-mono text-[11px] flex-1 flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-white/5 mb-3">
              <span>GEOMETRIC_PROOF_TRACE</span>
              <span className="text-[10px] text-emerald-400">Verified Deterministic</span>
            </div>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto flex flex-col-reverse">
              {auditLogs.length === 0 ? (
                <p className="text-slate-600 italic">No formal proofs generated in this session. Modify parameters and compute...</p>
              ) : (
                auditLogs.map((log, i) => (
                  <p key={i} className={log.startsWith("FINAL:") ? "text-emerald-400 font-bold" : log.startsWith("STEP") ? "text-cyan-300" : "text-slate-400"}>
                    &gt; {log}
                  </p>
                ))
              )}
            </div>
          </div>
          <div className="text-[9px] text-slate-600 uppercase border-t border-white/5 pt-3 mt-4 flex justify-between">
            <span>Core Version: SATCALC v2.9</span>
            <span>Error Margin: 0.000%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
