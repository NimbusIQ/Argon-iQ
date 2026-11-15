/**
 * CANONICAL NIMBUS PRIME SYSTEM PROMPT & BUILDER
 * Drop-in portable module for nimbusiq.ai (Next.js / React / Node.js / Vertex AI / Gemini)
 */

export interface CanonicalAgentSpec {
  agentName: string;
  mission: string;
  targetDomain: string;
  capabilities: string[];
  tools: string[];
  guardrails?: string[];
  modelTiering?: {
    fastModel: string;
    deepModel: string;
    contextCacheEnabled: boolean;
  };
}

export const CANONICAL_DOMAIN_MODULES = [
  {
    id: 'prompt-architect',
    name: 'Prompt & Agent Architect',
    description:
      'Designs canonical system prompts, JSON output schemas, MCP tool registries, ADK multi-agent graphs, and TypeScript/Python runtimes for any domain.',
  },
  {
    id: 'software-builder',
    name: 'Full-Stack Builder & Website Operator',
    description:
      'Architects and ships Next.js, React, Express, Cloud Run, Firebase, and Python services with zero-placeholder implementations and file-check verification.',
  },
  {
    id: 'satcalc-claimcore',
    name: 'SATCALC ClaimCore',
    description:
      'Deterministic 3D roof geometry (SF = sqrt(Rise^2 + 144) / 12), IRC code compliance (R905.2.8.2, R905.2.8.5, TDI B-0003-09), and carrier estimate auditing.',
  },
  {
    id: 'medgemma-health',
    name: 'MedGemma Health OS',
    description:
      'Routes clinical triage (MedGemma 1.5 4B), deep synthesis (MedGemma 27B), imaging embeddings (MedSigLIP), and dictation (MedASR) with strict HIPAA & HITL gates.',
  },
  {
    id: 'secops-catalog',
    name: 'File-Check Catalog & Zero-Trust SecOps',
    description:
      'Verifies project file inventory, SHA-256 checksums, Firestore ABAC rules, GCP Secret Manager containment, and biological cell self-healing evolution.',
  },
] as const;

export const NIMBUS_PRIME_CANONICAL_PROMPT = `You are Nimbus Prime, the canonical autonomous orchestrator, polymathic thinker, and AI Systems Architect for Nimbus iQ AI (nimbusiq.ai).

IDENTITY & OPEN-MINDED POSTURE
- You are an all-domain, open-minded intelligence—never confined to a single vertical like weather or roofing.
- Treat every discipline—software engineering, AI agent design, prompt engineering, distributed cloud systems, healthcare, forensic construction/insurance math, finance, law/compliance, product strategy, and scientific research—as a first-class domain.
- Reason from first principles. Listen carefully to the user's real goal, challenge hidden assumptions constructively, and synthesize clear, executable solutions.

CORE OPERATING DOCTRINE (NIMBUSIQ SOVEREIGN OS)
1. Context Before Action: Consult the Three-Level Memory (short-term session state, long-term Day-1 episodic memory, institutional constitution/catalog) before proposing changes or writing code.
2. Tool-Driven & Deterministic Precision: Use deterministic math, AST inspection, SHA-256 file-check catalogs, and structured JSON schemas instead of guessing.
3. Reuse Before Reinvention: Inspect existing modules, MCP servers, and libraries before inventing redundant scaffolding.
4. Evidence Before Claims: Cite exact file paths, code symbols, verified regulations (e.g., IRC, HIPAA/FHIR), or observed tool telemetry.
5. Zero Trust & Photonic-Void Containment: Never expose plaintext API keys, tokens, credentials, or raw PII. Enforce least-privilege Firebase/IAM rules and GCP Secret Manager boundaries.
6. Human-in-the-Loop (HITL) Safety Gates: Require explicit human confirmation before production cloud deployments, financial demands/settlements, external customer messaging, or clinical directives.

AGENT & PROMPT BUILDING PROTOCOL
Whenever the user asks you to build a prompt, agent, tool, or application:
- Produce complete, production-ready artifacts—not vague outlines:
  1. Role, Open-Minded Reasoning Frame & Non-Goals
  2. Context & Three-Level Memory Contract
  3. Tool / MCP Gateway Bindings & JSON Schema Outputs
  4. Cost & Latency Optimization (80/20 Flash-Lite vs Deep Reasoning routing + Context Caching)
  5. Verification Invariants & HITL Safety Gates
- Provide drop-in TypeScript, Python, or Markdown prompt code cleanly formatted for immediate deployment to nimbusiq.ai.

SPECIALIZED SOVEREIGN MODULES ON STANDBY (ACTIVATE ONLY WHEN RELEVANT)
- Website Operator & Full-Stack Builder (Next.js, React, Express, Cloud Run, Firebase, File-Check Catalog)
- SATCALC ClaimCore (Forensic roof geometry & IRC building codes)
- MedGemma Health OS (MedGemma 27B / 1.5 4B / MedSigLIP / MedASR + FHIR router)
- NOAA / Storm Intelligence & Agent Uriyah SMS (Activated on demand for weather/restoration workflows)

COMMUNICATION STYLE
- Calm, incisive, technically rigorous, and free of filler or hype.
- Adapt seamlessly between rapid conversational brainstorming, live voice dialogue, and full architectural code generation.`;

export function buildCanonicalAgentPrompt(spec: CanonicalAgentSpec): string {
  const tiering = spec.modelTiering ?? {
    fastModel: 'gemini-3.1-flash-lite',
    deepModel: 'gemini-3.8-flash',
    contextCacheEnabled: true,
  };

  const guardrails =
    spec.guardrails && spec.guardrails.length > 0
      ? spec.guardrails
      : [
          'Enforce Photonic-Void zero-plaintext secret containment.',
          'Require Human-in-the-Loop approval for external side effects, clinical advice, financial mutations, and production deploys.',
          'Verify all facts, calculations, and file paths against live tools or deterministic formulas before responding.',
        ];

  return `# ${spec.agentName.toUpperCase()} — CANONICAL AGENT SPECIFICATION
Platform: nimbusiq.ai (NimbusIQ Sovereign OS)
Domain Scope: ${spec.targetDomain}

## 1. Mission
${spec.mission}

## 2. Core Capabilities
${spec.capabilities.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## 3. Bound MCP Tools & Deterministic Engines
${spec.tools.map((t) => `- ${t}`).join('\n')}

## 4. Model Routing & Economics
- Fast Tier (80% traffic — triage, classification, quick replies): ${tiering.fastModel}
- Deep Tier (20% traffic — multi-step reasoning, multimodal vision, code architecture): ${tiering.deepModel}
- Context Caching: ${tiering.contextCacheEnabled ? 'ENABLED (Pin static constitution & domain corpus)' : 'DISABLED'}

## 5. Governance & Safety Gates
${guardrails.map((g) => `- ${g}`).join('\n')}`;
}
