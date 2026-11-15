// packages/vertical-blueprints/schema.ts

export type VerticalDomain =
  | 'fullstack-architect'
  | 'quant-finance'
  | 'workflow-ops'
  | 'browser-automation'
  | 'computer-use'
  | 'fintech-secops'
  | 'healthcare-hipaa'
  | 'legal-discovery'
  | 'custom';

export type DataResidency =
  | 'vpc-isolated'
  | 'gcp-us-central1'
  | 'eu-sovereign'
  | 'air-gapped-onprem';

export type ViewportTab = 'preview' | 'browser' | 'desktop' | 'terminal' | 'audit';

export type ExecutionDomain =
  | 'CORE'
  | 'ADK/A2A'
  | 'RAG'
  | 'TERMINAL'
  | 'BROWSER'
  | 'DESKTOP'
  | 'MCP';

export interface NimbusBrowserPolicy {
  enabled: boolean;
  headlessChromium: boolean;
  domainAllowlist: string[];
  requireHitlBeforeSubmit: boolean;
  captureDomSnapshots: boolean;
}

export interface NimbusComputerPolicy {
  enabled: boolean;
  sandboxRuntime: 'firecracker-microvm' | 'docker-rootless' | 'gvisor-k8s';
  resolution: '1920x1080' | '1280x800';
  allowedShellBinaries: string[];
  filesystemMount: string;
  requireHitlOnSystemMutate: boolean;
}

export interface NimbusBotBlueprint {
  id: string;
  handle: string;
  name: string;
  tagline: string;
  vertical: VerticalDomain;
  defaultTab: ViewportTab;

  // Model & Reasoning Routing
  primaryModel: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite' | 'vertex-sovereign-endpoint';
  temperature: number;
  maxReasoningSteps: number;

  // Sovereign Governance & Zero-Trust Boundaries
  residency: DataResidency;
  zeroRetention: boolean;
  requireHumanApprovalForMutations: boolean;

  // Tool, RAG, A2A & Runtime Planes
  allowedMcpTools: string[];
  ragCollections: string[];
  a2aPeers: string[];
  browserPolicy?: NimbusBrowserPolicy;
  computerPolicy?: NimbusComputerPolicy;

  // Prompt & UX
  systemPrompt: string;
  starterPrompts: string[];
}

export interface SovereignStep {
  id: string;
  domain: ExecutionDomain;
  label: string;
  status: 'running' | 'done' | 'hitl_wait';
  detail?: string;
  ms?: number;
}

export interface GeneratedMetricCard {
  label: string;
  value: string;
  delta: string;
}

export interface GeneratedTelemetryRow {
  entity: string;
  stage: string;
  metric: string;
  status: string;
}

export interface GeneratedAppSpec {
  appTitle: string;
  subtitle: string;
  primaryActionLabel: string;
  metrics: GeneratedMetricCard[];
  rows: GeneratedTelemetryRow[];
  adkCode: string;
}

export interface BrowserDomRow {
  vendor: string;
  sku: string;
  qty: string;
  total: string;
  status: string;
}

export interface AuditLedgerRecord {
  id: string;
  ts: string;
  plane: ExecutionDomain | 'ADK' | 'CORE';
  action: string;
  status: 'VERIFIED' | 'BLOCKED' | 'PENDING_HITL';
  hash: string;
}
