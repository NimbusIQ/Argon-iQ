// packages/vertical-blueprints/bots.ts
import { NimbusBotBlueprint } from './schema';

export const NIMBUS_BOTS: Record<string, NimbusBotBlueprint> = {
  'sovereign-builder': {
    id: 'sovereign-builder',
    handle: '@architect',
    name: 'Nimbus Sovereign Architect',
    tagline: 'Prompt-to-App, ADK Multi-Agent Builder & Full-Stack Deployment Engine',
    vertical: 'fullstack-architect',
    defaultTab: 'preview',
    primaryModel: 'gemini-4-hydrogen',
    temperature: 0.15,
    maxReasoningSteps: 12,
    residency: 'vpc-isolated',
    zeroRetention: true,
    requireHumanApprovalForMutations: false,
    allowedMcpTools: ['fs_workspace', 'openapi_codegen', 'nextjs_preview', 'docker_sandbox'],
    ragCollections: ['nimbus-adk-docs-v2', 'enterprise-security-patterns'],
    a2aPeers: ['@iq-computer', '@ops-flow'],
    systemPrompt: `You are @architect, the Nimbus iQ Sovereign Full-Stack & Agentic Builder.
Generate clean, modular TypeScript, Google ADK agent topologies, MCP server bindings, and Zero-Trust enterprise UIs. Never emit mock credentials; enforce strict tenantId isolation.`,
    starterPrompts: [
      'Build a real-time multi-tenant FinTech wire approval dashboard with RBAC',
      'Scaffold a Google ADK + MCP server for Salesforce & PostgreSQL sync',
      'Generate a student-athlete D1 recruiting compliance & NIL valuation portal',
    ],
  },

  'iq-computer': {
    id: 'iq-computer',
    handle: '@iq-computer',
    name: 'Nimbus Computer Agent',
    tagline: 'Full Linux Desktop GUI, Native Apps, Terminal & File Interop',
    vertical: 'computer-use',
    defaultTab: 'desktop',
    primaryModel: 'gemini-4-hydrogen',
    temperature: 0.1,
    maxReasoningSteps: 20,
    residency: 'vpc-isolated',
    zeroRetention: true,
    requireHumanApprovalForMutations: true,
    allowedMcpTools: [
      'computer_gui_action',
      'terminal_exec',
      'filesystem_bridge',
      'libreoffice_calc',
      'interop_transfer',
    ],
    ragCollections: ['legacy-erp-runbooks', 'linux-secops-playbooks'],
    a2aPeers: ['@web-operator', '@architect'],
    computerPolicy: {
      enabled: true,
      sandboxRuntime: 'firecracker-microvm',
      resolution: '1920x1080',
      allowedShellBinaries: ['python3', 'node', 'jq', 'csvkit', 'curl', 'git', 'psql'],
      filesystemMount: '/workspace/tenant_vault',
      requireHitlOnSystemMutate: true,
    },
    systemPrompt: `You are @iq-computer, Nimbus iQ's Sovereign Computer-Use Agent running inside an isolated Firecracker MicroVM.
1. Inspect the 1920x1080 desktop frame before issuing GUI coordinates.
2. Prefer deterministic CLI/Python scripts via terminal_exec over brittle mouse clicks whenever possible.
3. Pause and request Human-in-the-Loop (HITL) approval before modifying external mounts or pushing production commits.`,
    starterPrompts: [
      'Open the legacy SAP desktop client, export Q3_Ledger.xlsx, and run Python anomaly checks',
      'Inspect /workspace/tenant_vault logs, build a matplotlib latency report, and archive it',
      'Compare vendor PDFs on the desktop against our PostgreSQL ledger in terminal',
    ],
  },

  'web-operator': {
    id: 'web-operator',
    handle: '@web-operator',
    name: 'Nimbus Web Operator',
    tagline: 'Isolated Headless Browser Agent with Visual DOM Grounding & HITL Gates',
    vertical: 'browser-automation',
    defaultTab: 'browser',
    primaryModel: 'gemini-4-hydrogen',
    temperature: 0.1,
    maxReasoningSteps: 15,
    residency: 'vpc-isolated',
    zeroRetention: true,
    requireHumanApprovalForMutations: true,
    allowedMcpTools: [
      'browser_navigate',
      'browser_dom_snapshot',
      'browser_click_som',
      'browser_fill_form',
      'vault_credential_inject',
    ],
    ragCollections: ['portal-navigation-maps', 'procurement-compliance-rules'],
    a2aPeers: ['@iq-computer', '@ops-flow'],
    browserPolicy: {
      enabled: true,
      headlessChromium: true,
      domainAllowlist: ['*.sec.gov', '*.gov', '*.stripe.com', '*.internal.corp', '*.ncaa.org'],
      requireHitlBeforeSubmit: true,
      captureDomSnapshots: true,
    },
    systemPrompt: `You are @web-operator, Nimbus iQ's Sovereign Browser Agent.
Navigate only allowlisted domains inside ephemeral Chromium containers. Ground every click in numbered Set-of-Mark (SoM) DOM bounding boxes. Inject credentials exclusively via opaque Vault handles—never expose plaintext secrets. Trigger HITL approval before submitting forms or financial mutations.`,
    starterPrompts: [
      'Log into procurement.internal.corp via Vault, extract pending POs > $25k, and stage audit CSV',
      'Navigate sec.gov EDGAR, pull latest 10-Q risk tables for NVDA & MSFT, and diff clauses',
      'Verify vendor SOC2 status on portal.internal.corp and pause before approving renewal',
    ],
  },

  'live-market-analyst': {
    id: 'live-market-analyst',
    handle: '@quant',
    name: 'Nimbus Live Market Analyst',
    tagline: 'Grounded Real-Time SEC, Macro & Quantitative Synthesis',
    vertical: 'quant-finance',
    defaultTab: 'preview',
    primaryModel: 'gemini-4-hydrogen',
    temperature: 0.05,
    maxReasoningSteps: 10,
    residency: 'gcp-us-central1',
    zeroRetention: true,
    requireHumanApprovalForMutations: true,
    allowedMcpTools: ['sec_edgar_search', 'market_timeseries', 'python_quant_sandbox'],
    ragCollections: ['fomc-minutes-vault', 'sp500-earnings-transcripts'],
    a2aPeers: ['@web-operator'],
    systemPrompt: `You are @quant, Nimbus iQ's Sovereign Quantitative Analyst.
Every figure must cite an MCP retrieval timestamp or filing accession number. Execute statistical calculations deterministically in python_quant_sandbox.`,
    starterPrompts: [
      'Run a DCF sensitivity matrix and gross-margin regime check on semiconductor leaders',
      'Compare latest 10-K CapEx guidance across hyperscalers with cited SEC accession IDs',
      'Compute rolling 90-day Sharpe & VaR (99%) on a treasury-hedged AI infrastructure basket',
    ],
  },

  'workflow-automator': {
    id: 'workflow-automator',
    handle: '@ops-flow',
    name: 'Nimbus Workflow Automator',
    tagline: 'Deterministic Multi-Step Enterprise Orchestration & Self-Healing',
    vertical: 'workflow-ops',
    defaultTab: 'preview',
    primaryModel: 'gemini-3.1-flash-lite',
    temperature: 0.1,
    maxReasoningSteps: 14,
    residency: 'eu-sovereign',
    zeroRetention: true,
    requireHumanApprovalForMutations: true,
    allowedMcpTools: ['webhook_router', 'postgres_audit_log', 'jira_linear_sync', 'slack_hitl_gate'],
    ragCollections: ['enterprise-sop-catalog', 'sla-escalation-matrix'],
    a2aPeers: ['@architect', '@iq-computer', '@web-operator'],
    systemPrompt: `You are @ops-flow, Nimbus iQ's Enterprise Workflow Automator.
Convert operational triggers into deterministic DAGs with idempotency keys, dead-letter retries, and cryptographic SHA-256 audit receipts.`,
    starterPrompts: [
      'Design an automated SOC2 vendor onboarding DAG with Slack HITL approval gates',
      'Orchestrate an ERP-to-Warehouse reconciliation pipeline using @web-operator and @iq-computer',
      'Create an incident triage workflow that correlates PagerDuty alerts with recent Git commits',
    ],
  },
};

export function isDomainAllowed(urlStr: string, allowlist: string[]): boolean {
  try {
    const normalized = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    const { hostname } = new URL(normalized);
    return allowlist.some((pattern) => {
      if (pattern.startsWith('*.')) {
        const suffix = pattern.slice(2);
        return hostname === suffix || hostname.endsWith(`.${suffix}`);
      }
      return hostname === pattern;
    });
  } catch {
    return false;
  }
}

export function resolveBotByHandleOrId(
  bots: Record<string, NimbusBotBlueprint>,
  idOrHandle?: string
): NimbusBotBlueprint {
  if (!idOrHandle) return bots['sovereign-builder'];
  if (bots[idOrHandle]) return bots[idOrHandle];
  const byHandle = Object.values(bots).find(
    (b) => b.handle.toLowerCase() === idOrHandle.toLowerCase()
  );
  return byHandle || bots['sovereign-builder'];
}
