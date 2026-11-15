export type UserRole = 
  | 'Owner' 
  | 'Admin' 
  | 'Developer' 
  | 'Operator' 
  | 'Viewer' 
  | 'Agent' 
  | 'Service Account';

export type TaskStatus = 
  | 'PENDING' 
  | 'RUNNING' 
  | 'WAITING_APPROVAL' 
  | 'VERIFYING' 
  | 'COMPLETED' 
  | 'FAILED';

export type ToolRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH_APPROVAL';

export interface AgentTimelineStep {
  id: string;
  stage: 'CONTEXT' | 'PLAN' | 'TOOL' | 'EXECUTION' | 'OBSERVATION' | 'VERIFICATION' | 'RESULT' | 'MEMORY';
  title: string;
  detail: string;
  toolUsed?: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  metrics?: {
    latencyMs?: number;
    tokens?: number;
    confidence?: number;
  };
}

export interface SuperAgentTask {
  id: string;
  title: string;
  prompt: string;
  assignedAgent: string;
  status: TaskStatus;
  riskLevel: ToolRiskLevel;
  timeline: AgentTimelineStep[];
  result?: string;
  tokensUsed: number;
  latencyMs: number;
  createdAt: string;
  requiresApproval?: boolean;
  approvalDetails?: {
    action: string;
    target: string;
    diffSnippet?: string;
    requestedBy: string;
  };
}

export interface AutonomousAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: 'IDLE' | 'PLANNING' | 'EXECUTING' | 'VERIFYING' | 'WAITING_APPROVAL';
  tools: string[];
  taskCount: number;
  systemPrompt: string;
  avatarIcon: string;
  specialization: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: 'code' | 'cloud' | 'search' | 'memory' | 'security' | 'domain';
  description: string;
  riskLevel: ToolRiskLevel;
  enabled: boolean;
  usageCount: number;
  parametersSchema: Record<string, string>;
  mockOutputExample: string;
}

export interface MemoryRecord {
  id: string;
  key: string;
  category: 'episodic' | 'semantic' | 'code_graph' | 'blueprint' | 'forensic';
  content: string;
  relevanceScore: number;
  lastAccessed: string;
  tags: string[];
  dayOneLineage?: boolean;
  sourceAssetId?: string;
}

export interface AgentIQNode {
  branch: string;
  items: string[];
}

export interface AgentIQAsset {
  id: string;
  title: string;
  sourceLabel: string;
  category: 'workflow_mindmap' | 'unit_economics' | 'secops_lineage' | 'uploaded_visual';
  summary: string;
  extractedNodes: AgentIQNode[];
  formulasOrRules: string[];
  ingestedAt: string;
  dayOneOrigin: boolean;
  imageDataUrl?: string;
  tags: string[];
}

export interface CacheCorpusEntry {
  id: string;
  title: string;
  category: string;
  tokenEstimate: number;
  pinned: boolean;
  hitCount: number;
  costReductionPct: number;
  summary: string;
}

export interface AIOptimizationMetrics {
  routingMode: 'auto_80_20' | 'flash_lite' | 'flash_deep';
  totalRequests: number;
  flashLiteRequests: number;
  deepReasoningRequests: number;
  cacheHits: number;
  tokensProcessed: number;
  cachedTokensSaved: number;
  estimatedActualCostUsd: number;
  unoptimizedBaselineUsd: number;
  costReductionPct: number;
}

export interface SmsIntakeRecord {
  id: string;
  senderPhone: string;
  city: string;
  inboundText: string;
  intentCategory: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  psdEstimate: number;
  automatedReply: string;
  bookingLink: string;
  crmLeadId: string;
  timestamp: string;
}

export interface LeverageContentItem {
  id: string;
  targetCity: string;
  radarStation: string;
  hailSizeInches: number;
  windSpeedMph: number;
  reflectivityDbz: number;
  psdScore: number;
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  seoTitle: string;
  slugPath: string;
  metaDescription: string;
  heroHeadline: string;
  bodyMarkdown: string;
  smsOutreachCopy: string;
  publishTargets: string[];
  status: 'PUBLISHED_EDGE' | 'DRAFT_READY';
  createdAt: string;
}

export interface PendingApproval {
  id: string;
  taskId: string;
  taskTitle: string;
  action: string;
  riskLevel: ToolRiskLevel;
  requestedByAgent: string;
  timestamp: string;
  payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
}

// Domain Types (Roofing / Restoration & Cloudflare Infrastructure)
export interface Claim {
  id: string;
  homeowner: string;
  location: string;
  carrier: string;
  initialEstimate: number;
  revisedEstimate: number;
  delta: number;
  deductible: number;
  contractorAllocated: number;
  paymentsMade: number;
  pitch: string;
  footprint: number;
  facets: number;
  hipsValleysLF: number;
  violations: string[];
  status: 'AUDITED_COMPLIANT' | 'SUPPLEMENT_PENDING' | 'UNDER_REVIEW' | 'PAID_SETTLED';
  examinerName: string;
  examinerEmail: string;
  companyCamUrl: string;
}

export interface DomainMetric {
  name: string;
  traffic: string;
  cacheRate: string;
  status: string;
  sslGrade: string;
}

export interface CloudflareState {
  cacheRate: string;
  connectionSpeed: string;
  webTraffic: number;
  appLogins: number;
  zeroTrustSeatsUsed: number;
  zeroTrustSeatsTotal: number;
  tunnelsActive: number;
  agentLeeEnabled: boolean;
  agentLeeToken: string;
}
