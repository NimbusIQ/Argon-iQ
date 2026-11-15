import { 
  Claim, DomainMetric, CloudflareState, 
  AutonomousAgent, ToolDefinition, SuperAgentTask, MemoryRecord, PendingApproval,
  AgentIQAsset, CacheCorpusEntry, SmsIntakeRecord, LeverageContentItem
} from './types';

export const INITIAL_AGENTS: AutonomousAgent[] = [
  {
    id: 'agent-orchestrator',
    name: 'Nimbus Master Orchestrator',
    role: 'Runtime Planner & Router',
    model: 'gemini-3.8-flash',
    status: 'IDLE',
    tools: ['model_router', 'task_decomposer', 'memory_search', 'verify_engine'],
    taskCount: 142,
    systemPrompt: 'You are the central runtime planner. Enforce: Context before action, Tool-driven execution, and verify before completion.',
    avatarIcon: 'Cpu',
    specialization: 'Task decomposition, sub-agent routing, and validation graphs'
  },
  {
    id: 'agent-code-graph',
    name: 'Code Graph Inspector',
    role: 'AST & Repository Auditor',
    model: 'gemini-3.8-flash',
    status: 'IDLE',
    tools: ['code_graph_inspect', 'ast_parser', 'git_patch_generator', 'lint_analyzer'],
    taskCount: 98,
    systemPrompt: 'Inspect codebases with deep static analysis. Reuse before reinventing. Verify AST schemas and exports.',
    avatarIcon: 'Terminal',
    specialization: 'Code auditing, dependency resolution, refactoring & security analysis'
  },
  {
    id: 'agent-cloudrun-deployer',
    name: 'Cloud Run DevOps Agent',
    role: 'Serverless & Microservices',
    model: 'gemini-3.8-flash',
    status: 'IDLE',
    tools: ['cloudrun_deploy', 'secret_manager', 'docker_build_validate', 'gcp_iam_audit'],
    taskCount: 64,
    systemPrompt: 'Manage GCP Cloud Run services with zero-downtime, canary deployments, and strict IAM boundaries.',
    avatarIcon: 'Layers',
    specialization: 'GCP Cloud Run orchestration, Dockerfile linting, container builds'
  },
  {
    id: 'agent-rag-memory',
    name: 'Vector & RAG Memory Agent',
    role: 'Episodic Memory Retriever',
    model: 'gemini-3.1-flash-lite',
    status: 'IDLE',
    tools: ['vector_similarity_search', 'semantic_chunker', 'memory_writer', 'citation_extractor'],
    taskCount: 219,
    systemPrompt: 'Retrieve high-precision context embeddings from Firestore vector index. Provide evidence before claims.',
    avatarIcon: 'Database',
    specialization: 'Semantic search, dynamic prompt augmentation, long-term memory'
  },
  {
    id: 'agent-governance-sentinel',
    name: 'Governance & Photonic Sentinel',
    role: 'RBAC & Policy Guardrail',
    model: 'gemini-3.8-flash',
    status: 'IDLE',
    tools: ['rbac_policy_evaluator', 'secret_leak_scanner', 'human_approval_gate', 'photonic_guard'],
    taskCount: 312,
    systemPrompt: 'Enforce zero-plaintext secret leakage and block unauthorized production mutations without human signoff.',
    avatarIcon: 'Shield',
    specialization: 'Human-in-the-loop approvals, secret redaction, safety policies'
  },
  {
    id: 'agent-domain-solver',
    name: 'Roofing Forensic Engine',
    role: 'IRC & SATCALC Specialist',
    model: 'gemini-3.8-flash',
    status: 'IDLE',
    tools: ['roof_trig_calc', 'irc_code_lookup', 'estimate_delta_reconciler', 'companycam_ingest'],
    taskCount: 184,
    systemPrompt: 'Execute deterministic mathematical slope adjustments (√(Rise² + 12²)/12) and enforce IRC R905.2.8.2.',
    avatarIcon: 'Calculator',
    specialization: 'Trigonometric slope math, carrier line-item auditing, IRC codes'
  },
  {
    id: 'agent-uriyah-sms',
    name: 'Agent Uriyah (SMS & Intent)',
    role: 'Inbound SMS & CRM Router',
    model: 'gemini-3.1-flash-lite',
    status: 'IDLE',
    tools: ['wpcode_sms_webhook', 'uriyah_intent_classifier', 'inspection_booking_link', 'crm_lead_push'],
    taskCount: 428,
    systemPrompt: 'Categorize inbound storm SMS queries with sub-200ms latency, evaluate roof damage urgency, issue instant automated inspection booking links, and notify CRM.',
    avatarIcon: 'MessageSquare',
    specialization: 'Inbound SMS intent categorization, automated booking links, CRM lead routing'
  },
  {
    id: 'agent-sentinel-weather',
    name: 'Sentinel Weather & Bio-Cell',
    role: 'NOAA PSD & Autonomous SecOps',
    model: 'gemini-3.8-flash',
    status: 'IDLE',
    tools: ['noaa_radar_ingest', 'psd_score_calculator', 'geoseo_page_publisher', 'bio_cell_replicator'],
    taskCount: 276,
    systemPrompt: 'Monitor NOAA radar reflectivity & hail datasets, compute 0-100 Property Storm Damage (PSD) scores, trigger hyper-local Geo-SEO landing pages, and maintain biological cell self-evolving Day-1 history without manual prompts.',
    avatarIcon: 'Zap',
    specialization: 'NOAA anomaly detection, PSD 0-100 scoring, Geo-SEO publishing, zero-prompt cell evolution'
  }
];

export const INITIAL_TOOLS: ToolDefinition[] = [
  {
    id: 'tool-code-graph',
    name: 'Code Graph Inspector',
    category: 'code',
    description: 'Constructs AST symbol graphs and searches functions, interfaces, and imports across repos.',
    riskLevel: 'LOW',
    enabled: true,
    usageCount: 842,
    parametersSchema: { "path": "string", "query": "string", "depth": "number" },
    mockOutputExample: 'Found 14 references to AuthMiddleware. Exports: [verifyToken, checkRole]. Dependencies: [firebase-admin, jsonwebtoken].'
  },
  {
    id: 'tool-cloudrun-deploy',
    name: 'Cloud Run Service Deployer',
    category: 'cloud',
    description: 'Deploys containerized services to Google Cloud Run with autoscaling (0..10) and VPC connectors.',
    riskLevel: 'HIGH_APPROVAL',
    enabled: true,
    usageCount: 112,
    parametersSchema: { "serviceName": "string", "imageUri": "string", "region": "string", "envVars": "object" },
    mockOutputExample: 'Service "nimbus-ai-worker" deployed to us-west2. URL: https://worker-ik76qlyrgmxt-uc.a.run.app. Scale: 0-5.'
  },
  {
    id: 'tool-vertex-rag',
    name: 'Vertex AI Vector Knowledge Search',
    category: 'memory',
    description: 'Queries Firestore & Cloud SQL vector tables with cosine distance for relevant code snippets & documents.',
    riskLevel: 'LOW',
    enabled: true,
    usageCount: 1420,
    parametersSchema: { "query": "string", "topK": "number", "collection": "string" },
    mockOutputExample: 'Matched 3 documents (similarity 0.94): [IRC R905.2.8.2 Spec, Roof Pitch Multiplier Table, Firebase RBAC Rules].'
  },
  {
    id: 'tool-secret-manager',
    name: 'GCP Secret Manager Proxy',
    category: 'security',
    description: 'Fetches ephemeral credentials without leaking plaintext strings to browser memory or console logs.',
    riskLevel: 'HIGH_APPROVAL',
    enabled: true,
    usageCount: 349,
    parametersSchema: { "secretId": "string", "version": "string" },
    mockOutputExample: 'Secret fetched and injected into runtime ephemeral enclave. Plaintext masked under Photonic-Void.'
  },
  {
    id: 'tool-terminal-exec',
    name: 'Sandbox Terminal Runner',
    category: 'code',
    description: 'Runs isolated bash commands (linter, unit tests, package builds) inside Cloud Run microvm container.',
    riskLevel: 'MEDIUM',
    enabled: true,
    usageCount: 520,
    parametersSchema: { "command": "string", "timeoutSec": "number" },
    mockOutputExample: 'Exit Code 0: Tests passed (48 passed, 0 failed, duration: 1.2s).'
  },
  {
    id: 'tool-roof-trig',
    name: 'SATCALC Slope Calculator',
    category: 'domain',
    description: 'Deterministic 2D footprint to 3D square converter with pitch factor and facet waste adjustment.',
    riskLevel: 'LOW',
    enabled: true,
    usageCount: 683,
    parametersSchema: { "footprintSqFt": "number", "pitch": "string", "facets": "number" },
    mockOutputExample: 'Pitch 8/12 -> Slope Factor 1.20185. Net Squares: 26.44. Waste (15%): 3.97. Total Squares: 30.41.'
  },
  {
    id: 'tool-noaa-psd',
    name: 'NOAA Radar & PSD Score (0-100) Evaluator',
    category: 'domain',
    description: 'Ingests NOAA radar reflectivity, hail size/duration, and IoT wind sensors to compute weighted Property Storm Damage (PSD) scores.',
    riskLevel: 'LOW',
    enabled: true,
    usageCount: 514,
    parametersSchema: { "city": "string", "hailInches": "number", "windMph": "number", "reflectivityDbz": "number" },
    mockOutputExample: 'City: Frisco, TX -> Hail 1.75", Wind 68mph, 61 dBZ => PSD Score: 86/100 (SEVERE). Geo-SEO trigger armed.'
  },
  {
    id: 'tool-geoseo-publisher',
    name: 'Geo-SEO Hyper-Local Page Publisher',
    category: 'domain',
    description: 'Generates Vertex AI localized storm emergency roof repair landing pages and pushes via REST API to WordPress & Firebase.',
    riskLevel: 'MEDIUM',
    enabled: true,
    usageCount: 289,
    parametersSchema: { "targetCity": "string", "psdScore": "number", "stormSummary": "string" },
    mockOutputExample: 'Published /emergency-hail-roof-repair-frisco-tx to WordPress + Firebase Edge. JSON-LD Schema verified.'
  },
  {
    id: 'tool-uriyah-sms',
    name: 'Agent Uriyah SMS Intake & CRM Router',
    category: 'domain',
    description: 'Processes inbound SMS webhooks, runs Uriyah keyword intent classification, and dispatches instant inspection booking links.',
    riskLevel: 'LOW',
    enabled: true,
    usageCount: 731,
    parametersSchema: { "senderPhone": "string", "inboundText": "string", "city": "string" },
    mockOutputExample: 'Intent: EMERGENCY_HAIL_LEAK (0.98). Dispatched booking link https://nimbusroofing.com/inspect/dfw-fast and created CRM Lead.'
  }
];

export const INITIAL_TASKS: SuperAgentTask[] = [
  {
    id: 'task-001',
    title: 'Audit Firebase Security Rules & RBAC Permissions',
    prompt: 'Analyze Firestore rules for users/, agents/, and tool_registry/. Enforce Owner/Admin/Developer roles and prevent unauthorized mutations.',
    assignedAgent: 'Code Graph Inspector',
    status: 'COMPLETED',
    riskLevel: 'LOW',
    tokensUsed: 2840,
    latencyMs: 840,
    createdAt: '12 minutes ago',
    result: 'Audit Complete: Firestore security rules verified. Granular RBAC match patterns active for all 8 collections. Zero unauthenticated access leaks detected.',
    timeline: [
      {
        id: 'step-1',
        stage: 'CONTEXT',
        title: 'Load Repository Memory',
        detail: '3 memory records loaded: [firebase-blueprint.json, RBAC schema specification, Firestore rules template].',
        timestamp: '12m ago',
        status: 'completed',
        metrics: { latencyMs: 64, tokens: 420 }
      },
      {
        id: 'step-2',
        stage: 'PLAN',
        title: 'Formulate Security Inspection Plan',
        detail: 'Check match patterns for user role claims, verify write constraints on system collections, and simulate read exploits.',
        timestamp: '11m ago',
        status: 'completed',
        metrics: { latencyMs: 110, tokens: 680 }
      },
      {
        id: 'step-3',
        stage: 'TOOL',
        title: 'Invoke Code Graph Inspector',
        detail: 'Selected tool "Code Graph Inspector" to parse /firestore.rules and check rule depth and role token checks.',
        toolUsed: 'Code Graph Inspector',
        timestamp: '10m ago',
        status: 'completed',
        metrics: { latencyMs: 240, tokens: 530 }
      },
      {
        id: 'step-4',
        stage: 'EXECUTION',
        title: 'Execute Rule AST Parse',
        detail: 'Parsed 42 AST lines in firestore.rules. Checked isAuthenticated() guard on write blocks.',
        timestamp: '10m ago',
        status: 'completed',
        metrics: { latencyMs: 180, tokens: 410 }
      },
      {
        id: 'step-5',
        stage: 'VERIFICATION',
        title: 'Run Schema & Security Verification',
        detail: 'Rule simulator verified: Unauthenticated writes blocked (100% reject rate). Authenticated owner granted full schema access.',
        timestamp: '9m ago',
        status: 'completed',
        metrics: { latencyMs: 120, confidence: 0.99 }
      },
      {
        id: 'step-6',
        stage: 'RESULT',
        title: 'Synthesize Audit Report',
        detail: 'Rules passed verification with Grade A rating. No unauthenticated privilege escalation pathways found.',
        timestamp: '8m ago',
        status: 'completed',
        metrics: { latencyMs: 90, tokens: 380 }
      },
      {
        id: 'step-7',
        stage: 'MEMORY',
        title: 'Commit Findings to Memory Index',
        detail: 'Indexed audit digest under key "sec_audit_rules_v1". Stored in episodic knowledge bank.',
        timestamp: '8m ago',
        status: 'completed',
        metrics: { latencyMs: 36, tokens: 120 }
      }
    ]
  },
  {
    id: 'task-002',
    title: 'Deploy Nimbus AI Worker Microservice to Cloud Run',
    prompt: 'Build and deploy the Python reasoning microservice with autoscaling from 0 to 5 instances in us-west2.',
    assignedAgent: 'Cloud Run DevOps Agent',
    status: 'WAITING_APPROVAL',
    riskLevel: 'HIGH_APPROVAL',
    tokensUsed: 4200,
    latencyMs: 1420,
    createdAt: '5 minutes ago',
    requiresApproval: true,
    approvalDetails: {
      action: 'cloudrun.service.deploy',
      target: 'projects/google-mpf-u5ao4iqsmytq/services/nimbus-ai-worker',
      diffSnippet: `+ image: gcr.io/google-mpf-u5ao4iqsmytq/nimbus-ai-worker:v2.4
+ min-instances: 0
+ max-instances: 5
+ cpu: 2000m
+ memory: 2Gi
+ concurrency: 80`,
      requestedBy: 'Cloud Run DevOps Agent'
    },
    timeline: [
      {
        id: 'step-201',
        stage: 'CONTEXT',
        title: 'Load Deployment Specs',
        detail: 'Retrieved Dockerfile, requirements.txt, and GCP project IAM credentials from Secret Manager.',
        timestamp: '5m ago',
        status: 'completed',
        metrics: { latencyMs: 95, tokens: 620 }
      },
      {
        id: 'step-202',
        stage: 'PLAN',
        title: 'Generate Zero-Downtime Rollout Strategy',
        detail: 'Configure canary traffic split: 10% test traffic -> health probe check -> 100% traffic migration.',
        timestamp: '4m ago',
        status: 'completed',
        metrics: { latencyMs: 140, tokens: 590 }
      },
      {
        id: 'step-203',
        stage: 'TOOL',
        title: 'Select Cloud Run Deployer',
        detail: 'Invoking "Cloud Run Service Deployer" with high-risk policy tagging.',
        toolUsed: 'Cloud Run Service Deployer',
        timestamp: '3m ago',
        status: 'completed',
        metrics: { latencyMs: 210, tokens: 380 }
      },
      {
        id: 'step-204',
        stage: 'EXECUTION',
        title: 'Container Build & Pre-flight Linter',
        detail: 'Container image tagged and verified in Google Artifact Registry. Size: 184MB.',
        timestamp: '2m ago',
        status: 'completed',
        metrics: { latencyMs: 820, tokens: 940 }
      },
      {
        id: 'step-205',
        stage: 'OBSERVATION',
        title: 'Governance Sentinel Flagged Mutation',
        detail: 'Production deployment classified as HIGH_APPROVAL. Awaiting human administrator signoff.',
        timestamp: '1m ago',
        status: 'waiting_approval',
        metrics: { latencyMs: 50 }
      }
    ]
  },
  {
    id: 'task-003',
    title: 'Forensic Line-Item Audit: Enitan Property Claim',
    prompt: 'Reconcile State Farm adjuster estimate ($32,450.00) against Dallas municipal building code IRC R905.2.8.2 and SATCALC slope factoring.',
    assignedAgent: 'Roofing Forensic Engine',
    status: 'COMPLETED',
    riskLevel: 'LOW',
    tokensUsed: 3150,
    latencyMs: 720,
    createdAt: '24 minutes ago',
    result: 'Revised RCV: $41,200.00 (+8,750.00 delta). Line items recovered: Ice & Water barrier IRC R905.2.8.2, starter strip omission, and 16-facet waste correction.',
    timeline: [
      {
        id: 'step-301',
        stage: 'CONTEXT',
        title: 'Fetch Claim Profile & Geometry',
        detail: 'Loaded claim #enitan (2,200 sq ft footprint, 8/12 pitch, 16 facets, 120 LF hips/valleys).',
        timestamp: '24m ago',
        status: 'completed',
        metrics: { latencyMs: 40, tokens: 380 }
      },
      {
        id: 'step-302',
        stage: 'TOOL',
        title: 'Execute SATCALC Trigonometric Engine',
        detail: 'Applied formula SF = √(8² + 12²)/12 = 1.20185. Calculated gross roof area = 3,041 sq ft (30.41 squares).',
        toolUsed: 'SATCALC Slope Calculator',
        timestamp: '23m ago',
        status: 'completed',
        metrics: { latencyMs: 120, tokens: 490 }
      },
      {
        id: 'step-303',
        stage: 'EXECUTION',
        title: 'Reconcile Line-Item Shortfall',
        detail: 'Identified missing drip edge ($1,420), missing valley polymer sheet ($3,180), and waste under-allowance ($4,150). Total Delta: +$8,750.',
        timestamp: '22m ago',
        status: 'completed',
        metrics: { latencyMs: 290, tokens: 820 }
      },
      {
        id: 'step-304',
        stage: 'VERIFICATION',
        title: 'Cross-Check Texas Insurance Code Compliance',
        detail: 'Validated with IRC R905.2.8.2 municipal records and TDI Bulletin B-0003-09. All items fully substantiated.',
        timestamp: '21m ago',
        status: 'completed',
        metrics: { latencyMs: 140, confidence: 0.98 }
      },
      {
        id: 'step-305',
        stage: 'RESULT',
        title: 'Generate Forensic Certificate of Completion',
        detail: 'Compiled finalized Xactimate supplement packet with photographic exhibits.',
        timestamp: '20m ago',
        status: 'completed',
        metrics: { latencyMs: 90, tokens: 450 }
      },
      {
        id: 'step-306',
        stage: 'MEMORY',
        title: 'Commit Claim Precedent to Vector Store',
        detail: 'Saved claim precedent under ID "claim_precedent_statefarm_dallas_8_12".',
        timestamp: '20m ago',
        status: 'completed',
        metrics: { latencyMs: 40, tokens: 180 }
      }
    ]
  }
];

export const INITIAL_MEMORIES: MemoryRecord[] = [
  {
    id: 'mem-day1-weather-mindmap',
    key: 'weather_trigger_automation_mindmap',
    category: 'blueprint',
    content: 'Weather Mind Map Trigger & Automation Workflow: (1) NOAA Radar APIs + Sentinel Agent anomaly monitoring + Hail/IoT reflectivity feeds -> (2) Storm Severity Model calculates weighted Property Storm Damage (PSD) Score 0-100 across Low/Medium/High/Severe bands -> (3) Signal Agent triggers Vertex AI hyper-local Geo-SEO city landing pages pushed to WordPress & Firebase -> (4) Inbound SMS routed through WPCode REST webhook & Agent Uriyah keyword intent analysis for instant inspection booking links and CRM sync.',
    relevanceScore: 1.0,
    lastAccessed: 'Day-1 Core IQ',
    tags: ['Image-IQ', 'NOAA', 'PSD Score', 'Geo-SEO', 'Agent Uriyah', 'Day-1'],
    dayOneLineage: true,
    sourceAssetId: 'iq-weather-mindmap'
  },
  {
    id: 'mem-day1-gcp-unit-economics',
    key: 'gcp_unit_economics_75pct_caching_80_20',
    category: 'blueprint',
    content: 'GCP Unit Economics & AI Optimization Architecture: Achieves 75% reduction in token costs via Gemini Context Caching on repetitive domain corpora & system prompts, paired with strategic 80/20 Model Tiering (80% lightweight Flash tier at $0.075/1M input tokens; 20% complex high-reasoning Pro/Deep tier) and scale-to-zero serverless Cloud Run for predictable runway.',
    relevanceScore: 0.99,
    lastAccessed: 'Day-1 Core IQ',
    tags: ['Image-IQ', 'Context Caching', '80/20 Routing', 'Unit Economics', 'Day-1'],
    dayOneLineage: true,
    sourceAssetId: 'iq-gcp-unit-economics'
  },
  {
    id: 'mem-day1-bio-cell-secops',
    key: 'biological_cell_secops_day1_lineage',
    category: 'episodic',
    content: 'AI Security Ops Architecture (Scott Barneson — Google + Wiz): Autonomous agents operate like biological cells that evolve & replicate, generate their own verified code/workflows, execute autonomously with No Prompts (signal-triggered), enforce Wiz/air-gapped posture, and preserve immutable self-history from Day 1.',
    relevanceScore: 0.99,
    lastAccessed: 'Day-1 Core IQ',
    tags: ['Image-IQ', 'Biological Cell', 'Google + Wiz', 'Zero-Prompt', 'Day-1 History'],
    dayOneLineage: true,
    sourceAssetId: 'iq-bio-secops-notes'
  },
  {
    id: 'mem-101',
    key: 'irc_r905_code_requirements',
    category: 'forensic',
    content: 'IRC R905.2.8.2 mandates self-adhering polymer-modified bitumen sheet (Ice & Water Shield) across eaves, valleys, and vulnerable penetrations in designated Texas municipalities.',
    relevanceScore: 0.98,
    lastAccessed: '4 minutes ago',
    tags: ['IRC', 'Roofing', 'Building Code', 'Compliance'],
    dayOneLineage: true
  },
  {
    id: 'mem-102',
    key: 'satcalc_slope_formula',
    category: 'blueprint',
    content: 'SATCALC pure trigonometric formula: Slope Factor SF = √(Rise² + 12²) / 12. Hip/Valley Multiplier HVF = √(2 + (Rise/12)²). Multi-facet waste factor range 12% to 20%.',
    relevanceScore: 0.96,
    lastAccessed: '18 minutes ago',
    tags: ['SATCALC', 'Trigonometry', 'Geometry', 'Math'],
    dayOneLineage: true
  },
  {
    id: 'mem-103',
    key: 'firebase_rbac_policy_model',
    category: 'semantic',
    content: 'Roles: Owner, Admin, Developer, Operator, Viewer, Agent. Developer can read repo, patch code, and run sandbox. Production deployment requires Human-in-the-loop approval.',
    relevanceScore: 0.94,
    lastAccessed: '2 minutes ago',
    tags: ['Firebase', 'Auth', 'RBAC', 'Governance'],
    dayOneLineage: true
  },
  {
    id: 'mem-104',
    key: 'photonic_void_security_protocol',
    category: 'semantic',
    content: 'Zero-Plaintext Leakage: Under no circumstances disclose API keys, backend secrets, environment variables, or raw tokens in logs or client-facing state.',
    relevanceScore: 0.99,
    lastAccessed: 'Just now',
    tags: ['Security', 'Photonic Void', 'Zero Leakage', 'Enterprise'],
    dayOneLineage: true
  },
  {
    id: 'mem-105',
    key: 'cloudrun_zero_scale_config',
    category: 'code_graph',
    content: 'Cloud Run microservices configured with minScale=0, maxScale=10, 80 concurrent connections per container, and automated secret injection via GCP Secret Manager.',
    relevanceScore: 0.91,
    lastAccessed: '1 hour ago',
    tags: ['Cloud Run', 'GCP', 'DevOps', 'Microservices']
  }
];

export const INITIAL_IQ_ASSETS: AgentIQAsset[] = [
  {
    id: 'iq-weather-mindmap',
    title: 'Weather Mind Map: Trigger & Automation Workflow',
    sourceLabel: 'IMG_0385.jpeg • Multimodal Blueprint Ingested',
    category: 'workflow_mindmap',
    summary: 'End-to-end autonomous storm intelligence pipeline connecting NOAA radar anomaly detection and IoT hail/wind telemetry to a 0–100 Property Storm Damage (PSD) score, automated Geo-SEO city page publishing, and Agent Uriyah SMS intake routing.',
    extractedNodes: [
      {
        branch: '1. Weather Radar Signal Ingestion',
        items: [
          'NOAA Radar APIs → Sentinel Agent Monitoring (Radar anomaly detection) & Environmental Data Feed (Real-time weather scraping)',
          'Storm Data Sources → Radar Reflectivity (Storm intensity indexing), Hail Dataset Feed (Hail size & duration tracking), IoT Sensors (Local wind & hail metrics)'
        ]
      },
      {
        branch: '2. PSD Score Calculation',
        items: [
          'Storm Severity Model → Feature Inputs (Hail size & wind speed), Risk Band Classification (Low, Medium, High, Severe), Weighted Feature Formula',
          'Storm Intelligence Analyst → Vertex AI Integration (Model hint & risk evaluation) & Property Storm Damage Score (Numerical range 0 to 100)'
        ]
      },
      {
        branch: '3. Geo-SEO Publishing (Leverage Content)',
        items: [
          'Automated Content Generation → Signal Agent Trigger (Vertex AI text generation) & Landing Page Creator (Hyper-local city page publishing)',
          'Deployment & Distribution → API Push (WordPress & Firebase frontend integration) & Traffic Capture (Localized emergency roof repair targeting)'
        ]
      },
      {
        branch: '4. SMS Intake Workflows (Agent Uriyah)',
        items: [
          'Inbound SMS Processing → WPCode REST API SMS Route Initialization & Agent Uriyah Keyword Categorization',
          'Automated Response & Routing → Roof Damage Query (Instant automated inspection booking link) & CRM Integration (Lead notification & automated messaging)'
        ]
      }
    ],
    formulasOrRules: [
      'PSD Score (0–100) = min(100, round(HailInches * 28 + max(0, WindMph - 35) * 0.85 + max(0, ReflectivityDbz - 40) * 0.9))',
      'Risk Bands: 0–29 LOW | 30–54 MEDIUM | 55–79 HIGH | 80–100 SEVERE (Auto-arms Geo-SEO + SMS surge)',
      'Sub-60s Trigger SLA: Severe PSD event publishes localized city page to Firebase + WordPress REST API'
    ],
    ingestedAt: 'Day-1 Genesis',
    dayOneOrigin: true,
    tags: ['NOAA Radar', 'PSD 0-100', 'Geo-SEO', 'Agent Uriyah', 'Vertex AI']
  },
  {
    id: 'iq-gcp-unit-economics',
    title: 'Unit Economics with GCP: 75% Caching & 80/20 Model Tiering',
    sourceLabel: 'IMG_0383.jpeg • Google for Startups / SF Tech Week Blueprint',
    category: 'unit_economics',
    summary: 'Enterprise AI unit economics architecture driving a 75% reduction in token costs via Gemini Context Caching, paired with an 80/20 Flash-to-Complex multi-model router and scale-to-zero serverless Cloud Run compute.',
    extractedNodes: [
      {
        branch: 'Cost Reduction Trajectory (75% Savings)',
        items: [
          'Stage 1: Unoptimized Single-Model Baseline (100% spend, redundant system corpora resent every turn)',
          'Stage 2: Multi-Model Routing (80% lightweight Flash tier at $0.075/1M input tokens; 20% complex high-reasoning tier)',
          'Stage 3: Gemini Context Caching Active (75% reduction on pinned domain corpora, IRC codes, and system instructions)'
        ]
      },
      {
        branch: 'Predictable Runway & Cloud Security Posture',
        items: [
          'Serverless Billing: Cloud Run scale-to-zero prevents idle compute waste; Provisioned Throughput ready for surge storms',
          'Security & Air-Gapped Readiness: Google Cloud + Wiz cloud security posture & remote/air-gapped deployment compliance'
        ]
      }
    ],
    formulasOrRules: [
      '80/20 Model Router: Route classification, SMS intent, & standard lookups to Flash-Lite/Flash (80%); route multi-step forensic supplements & AST synthesis to High-Thinking Complex tier (20%)',
      'Context Cache Rule: Pin repetitive system prompts, IRC R905 codes, SATCALC formulas, and Weather Mind Map schemas for 75% cached token discount'
    ],
    ingestedAt: 'Day-1 Genesis',
    dayOneOrigin: true,
    tags: ['75% Cost Reduction', 'Context Caching', '80/20 Split', 'Wiz Security', 'TCO']
  },
  {
    id: 'iq-bio-secops-notes',
    title: 'Biological Cell AI SecOps & Day-1 Immutable Lineage',
    sourceLabel: 'IMG_0384.jpeg • Scott Barneson (Google + Wiz) Field Notes',
    category: 'secops_lineage',
    summary: 'Autonomous cyber-resilient agent architecture modeled after biological cell operations: self-evolving, self-replicating micro-enclaves that generate verified code, operate via signal triggers without manual prompts, and retain unbroken memory from Day 1.',
    extractedNodes: [
      {
        branch: 'Biological Cell Operations',
        items: [
          'Evolve & Replicate: Specialized micro-agents spawn isolated Cloud Run worker cells under storm or security load and fold learnings back into core DNA',
          'Generate Own Code: Deterministic synthesis of webhook routes, Geo-SEO schemas, and rule patches verified before commit'
        ]
      },
      {
        branch: 'Zero-Prompt Autonomy & Day-1 Lineage',
        items: [
          'No Prompts (Signal-Driven): Radar anomalies, webhook events, and security telemetry trigger autonomous execution loops without waiting for human prompt typing',
          'Keeps Own History From Day 1: Immutable episodic & forensic ledger persisted in Firestore so no institutional precedent is ever lost'
        ]
      }
    ],
    formulasOrRules: [
      'Zero-Prompt Trigger Invariant: External telemetry (NOAA dBZ >= 55 or Inbound SMS) initiates full ANALYZE -> PLAN -> VERIFY -> MEMORY loop autonomously',
      'Day-1 Lineage Guarantee: Every ingested visual blueprint, claim delta, and security audit is permanently stamped in episodic memory'
    ],
    ingestedAt: 'Day-1 Genesis',
    dayOneOrigin: true,
    tags: ['Scott Barneson', 'Google + Wiz', 'Biological Cell', 'No Prompts', 'Day-1 History']
  }
];

export const INITIAL_CACHE_CORPORA: CacheCorpusEntry[] = [
  {
    id: 'cache-irc-satcalc',
    title: 'Texas IRC R905.2.8.2 + TDI B-0003-09 + SATCALC Trig Corpus',
    category: 'Forensic Building Science',
    tokenEstimate: 34800,
    pinned: true,
    hitCount: 1284,
    costReductionPct: 75,
    summary: 'Full municipal drip-edge, valley Ice & Water Shield, starter strip codes, and 3D roof slope/waste factor lookup tables.'
  },
  {
    id: 'cache-weather-mindmap',
    title: 'NOAA Storm Radar + PSD (0-100) + Geo-SEO Templates Corpus',
    category: 'Leverage Content & Weather IQ',
    tokenEstimate: 33200,
    pinned: true,
    hitCount: 942,
    costReductionPct: 75,
    summary: 'DFW municipality metadata, NOAA NEXRAD hail/wind weighting matrices, and high-converting emergency roof repair JSON-LD schemas.'
  },
  {
    id: 'cache-uriyah-sms',
    title: 'Agent Uriyah SMS Intent Taxonomy & Sovereign Playbooks',
    category: 'Conversational & CRM Intake',
    tokenEstimate: 18600,
    pinned: true,
    hitCount: 1640,
    costReductionPct: 75,
    summary: 'Homeowner storm damage intent patterns, bilingual emergency triage scripts, and instant inspection calendar routing schemas.'
  },
  {
    id: 'cache-bio-secops',
    title: 'Photonic-Void + Wiz Cloud SecOps + RBAC AST Blueprint',
    category: 'Security & Governance',
    tokenEstimate: 24100,
    pinned: true,
    hitCount: 715,
    costReductionPct: 75,
    summary: 'Zero-plaintext redaction rules, Firestore security rule invariants, and biological cell self-verification contracts.'
  }
];

export const INITIAL_SMS_LOGS: SmsIntakeRecord[] = [
  {
    id: 'sms-901',
    senderPhone: '+1 (214) 555-0184',
    city: 'Frisco, TX',
    inboundText: 'Golf ball hail just hit near Legacy Dr and we have water spotting on our upstairs ceiling. Can someone inspect today?',
    intentCategory: 'EMERGENCY_HAIL_ACTIVE_LEAK',
    urgency: 'EMERGENCY',
    psdEstimate: 88,
    automatedReply: 'Nimbus Rapid Response (Agent Uriyah): Severe hail cell confirmed over Frisco (PSD 88/100). Priority tarp + forensic drone inspection reserved—pick your 30-min arrival window here: https://nimbusroofing.com/inspect/frisco-priority',
    bookingLink: 'https://nimbusroofing.com/inspect/frisco-priority',
    crmLeadId: 'CRM-DFW-8841',
    timestamp: '6 mins ago'
  },
  {
    id: 'sms-902',
    senderPhone: '+1 (972) 555-0149',
    city: 'McKinney, TX',
    inboundText: 'State Farm adjuster left out drip edge and ice & water barrier on our hail claim estimate. Do you review Xactimate scopes?',
    intentCategory: 'FORENSIC_SUPPLEMENT_AUDIT',
    urgency: 'HIGH',
    psdEstimate: 74,
    automatedReply: 'Nimbus Forensic Desk (Agent Uriyah): Yes—IRC R905.2.8.2 mandates drip edge & valley Ice/Water protection in McKinney. Upload your carrier PDF or book a forensic audit slot: https://nimbusroofing.com/inspect/supplement-audit',
    bookingLink: 'https://nimbusroofing.com/inspect/supplement-audit',
    crmLeadId: 'CRM-DFW-8839',
    timestamp: '19 mins ago'
  }
];

export const INITIAL_LEVERAGE_CAMPAIGNS: LeverageContentItem[] = [
  {
    id: 'lev-101',
    targetCity: 'Frisco, TX (75034)',
    radarStation: 'KFWS (DFW NEXRAD)',
    hailSizeInches: 1.75,
    windSpeedMph: 68,
    reflectivityDbz: 62,
    psdScore: 91,
    riskBand: 'SEVERE',
    seoTitle: 'Emergency 1.75" Hail Roof Inspection Frisco TX (75034) | IRC Code Certified',
    slugPath: '/storm-alert/frisco-tx-75034-emergency-hail-roof-repair',
    metaDescription: 'Confirmed 1.75" hail & 68 MPH winds tracked on KFWS radar over Frisco 75034 (PSD Score 91/100). Book same-day drone + SATCALC forensic roof inspection.',
    heroHeadline: 'KFWS Radar Alert: 1.75" Hail Core Tracked Over Frisco (PSD Severity: 91/100)',
    bodyMarkdown: `### Verified Storm Telemetry — Frisco, TX (75034)\n- **NOAA NEXRAD Station:** KFWS Reflectivity Peak **62 dBZ**\n- **Measured Hail Diameter:** **1.75 in.** (Golf-Ball Threshold — High Granule & Mat Fracture Probability)\n- **Peak Gust Velocity:** **68 MPH** | **Property Storm Damage (PSD) Score:** **91 / 100 (SEVERE)**\n\n### Forensic Carrier Protection Included\nEvery inspection includes deterministic **SATCALC 3D Slope Geometry** and **IRC R905.2.8.2** municipal code documentation so your insurer cannot omit Ice & Water Shield, drip edge, or multi-facet waste.`,
    smsOutreachCopy: 'Frisco Storm Alert: 1.75" hail logged on KFWS radar in 75034 (PSD 91/100). Reply INSPECT for a complimentary forensic drone roof check + carrier code audit.',
    publishTargets: ['Firebase Hosting Edge', 'WordPress REST API (nimbusroofing.com)'],
    status: 'PUBLISHED_EDGE',
    createdAt: '14 mins ago'
  }
];

export const INITIAL_APPROVALS: PendingApproval[] = [
  {
    id: 'appr-001',
    taskId: 'task-002',
    taskTitle: 'Deploy Nimbus AI Worker Microservice to Cloud Run',
    action: 'cloudrun.service.deploy',
    riskLevel: 'HIGH_APPROVAL',
    requestedByAgent: 'Cloud Run DevOps Agent',
    timestamp: '5 minutes ago',
    payload: {
      service: 'nimbus-ai-worker',
      region: 'us-west2',
      concurrency: 80,
      minInstances: 0,
      maxInstances: 5
    },
    status: 'pending'
  }
];

// Preserving existing domain data
export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'enitan',
    homeowner: 'Idowu Enitan',
    location: 'Dallas, TX',
    carrier: 'State Farm',
    initialEstimate: 32450.00,
    revisedEstimate: 41200.00,
    delta: 8750.00,
    deductible: 5500.00,
    contractorAllocated: 19000.00,
    paymentsMade: 20200.00,
    pitch: '8/12',
    footprint: 2200,
    facets: 16,
    hipsValleysLF: 120,
    violations: ['IRC R905.2.8.2 Compliance (Drip Edge)', 'IRC §R905.1.2 Valley Specs'],
    status: 'AUDITED_COMPLIANT',
    examinerName: 'Sam Barghpeima',
    examinerEmail: 'sbarghpeima@statefarm.com',
    companyCamUrl: 'https://companycam.com/galleries/enitan-dallas-roofing'
  },
  {
    id: 'mannix',
    homeowner: 'Michael Mannix',
    location: 'Frisco, TX',
    carrier: 'Allstate',
    initialEstimate: 28900.00,
    revisedEstimate: 36100.00,
    delta: 7200.00,
    deductible: 5500.00,
    contractorAllocated: 19000.00,
    paymentsMade: 16400.00,
    pitch: '10/12',
    footprint: 1850,
    facets: 18,
    hipsValleysLF: 140,
    violations: ['IRC §R905.2.3.2 Starter Shingle Omission', 'SB 458 Appraisal Delay'],
    status: 'SUPPLEMENT_PENDING',
    examinerName: 'Sarah Jenkins',
    examinerEmail: 'sjenkins@allstate.com',
    companyCamUrl: 'https://companycam.com/galleries/mannix-frisco-roofing'
  },
  {
    id: 'prior',
    homeowner: 'Lisa Prior',
    location: 'McKinney, TX',
    carrier: 'Liberty Mutual',
    initialEstimate: 42100.00,
    revisedEstimate: 53950.00,
    delta: 11850.00,
    deductible: 5500.00,
    contractorAllocated: 22500.00,
    paymentsMade: 28450.00,
    pitch: '9/12',
    footprint: 2800,
    facets: 22,
    hipsValleysLF: 190,
    violations: ['IRC R905.2.8.2 Compliance (Drip Edge)', 'TDI Bulletin B-0003-09 Matching Shingles'],
    status: 'UNDER_REVIEW',
    examinerName: 'Michael Vance',
    examinerEmail: 'mvance@libertymutual.com',
    companyCamUrl: 'https://companycam.com/galleries/prior-mckinney-roofing'
  },
  {
    id: 'krause',
    homeowner: 'Ellen Krause',
    location: 'Plano, TX',
    carrier: 'Farmers',
    initialEstimate: 24500.00,
    revisedEstimate: 30400.00,
    delta: 5900.00,
    deductible: 5500.00,
    contractorAllocated: 19000.00,
    paymentsMade: 14900.00,
    pitch: '6/12',
    footprint: 1600,
    facets: 12,
    hipsValleysLF: 80,
    violations: ['IRC §R905.2.3.2 Starter course omission'],
    status: 'PAID_SETTLED',
    examinerName: 'Sam Barghpeima',
    examinerEmail: 'sbarghpeima@farmers.com',
    companyCamUrl: 'https://companycam.com/galleries/krause-plano-roofing'
  },
  {
    id: 'merkel',
    homeowner: 'Michael Merkel',
    location: 'Anna, TX',
    carrier: 'State Farm',
    initialEstimate: 30500.00,
    revisedEstimate: 46211.71,
    delta: 15711.71,
    deductible: 5500.00,
    contractorAllocated: 19000.00,
    paymentsMade: 22711.71,
    pitch: '9/12',
    footprint: 2350,
    facets: 15,
    hipsValleysLF: 110,
    violations: ['IRC R905.2.8.2 Compliance (Drip Edge)', 'IRC §R905.1.2 Valley Specs'],
    status: 'AUDITED_COMPLIANT',
    examinerName: 'Sam Barghpeima',
    examinerEmail: 'sbarghpeima@statefarm.com',
    companyCamUrl: 'https://companycam.com/galleries/merkel-anna-roofing'
  }
];

export const INITIAL_DOMAINS: DomainMetric[] = [
  { name: 'nimbusroofing.com', traffic: '2.7K', cacheRate: '25.3%', status: 'Active', sslGrade: 'A+' },
  { name: 'nimbusiq.ai', traffic: '1.5K', cacheRate: '1.3%', status: 'Active', sslGrade: 'A+' }
];

export const INITIAL_CLOUDFLARE: CloudflareState = {
  cacheRate: '13.3%',
  connectionSpeed: '82ms',
  webTraffic: 4210,
  appLogins: 0,
  zeroTrustSeatsUsed: 0,
  zeroTrustSeatsTotal: 1,
  tunnelsActive: 1,
  agentLeeEnabled: false,
  agentLeeToken: 'cl_token_f498d92300bbf8a482e917d092'
};

export const SAAS_BIFURCATION_TEXT = {
  summary: `The Great SaaS Bifurcation refers to the structural decoupling of valuations and market success within the software ecosystem, driven by the rise of generative AI. While the broader public market has heavily penalized legacy software—a phenomenon some have dubbed the "SaaSpocalypse" due to extreme, crisis-level volatility—the disruption is not uniform.`,
  losers: {
    title: 'The Losers: "Thin Wrappers" and Point Solutions',
    points: [
      'Startups that have built thin interfaces or simple API wrappers on top of foundational large language models (LLMs) are facing an existential commodity risk.',
      'Because AI agents can now generate code rapidly and cheaply, the traditional software codebase is no longer a defensible moat.',
      'High Failure and Churn Rates: Industry reports project that 80% of AI startups (mostly API wrappers) will disappear by 2028. These tools currently suffer a 65% user churn rate, nearly double that of traditional SaaS.',
      'Lack of Architectural Depth: Lightweight applications built for immediate gains provide a "sugar high" of fast growth but fail to offer the deep, multi-step workflow integration necessary to retain enterprise customers.'
    ]
  },
  winners: {
    title: 'The Winners: Incumbents and "Systems of Record"',
    points: [
      'Despite initial market fears that AI would destroy established software providers, incumbent "Systems of Record" are emerging as the true beneficiaries of the AI revolution.',
      'While startups might have the AI technology, incumbents hold the strategic cards: distribution, security approvals, and proprietary customer data.',
      'Enterprises explicitly prefer buying AI solutions from their existing software vendors due to established trust and easier integration.',
      'AI Moats 2.0 include: The Edge-Case Moat (decades of encoded, interrelated business rules, compliance guardrails, and regulatory complexities such as municipal codes that AI cannot easily replicate or hallucinate), Data Gravity and Native Authority (high switching costs, deep embeddedness in mission-critical workflows), and The Distribution Advantage.'
    ]
  },
  monetization: {
    title: 'The Shift in Monetization',
    desc: 'The bifurcation is also forcing a radical rethinking of how software is sold. As AI moves from being a simple tool to an autonomous agent that substitutes human tasks, traditional seat-based (per-user) pricing models are coming under siege. In response, market leaders are transitioning toward new models, including usage-based pricing (pay-per-consumption) and value-based pricing (pay-for-performance or outcomes).'
  }
};
