export type FileCatalogCategory =
  | 'sovereign-os'
  | 'frontend'
  | 'backend'
  | 'firebase'
  | 'python-agent'
  | 'docs'
  | 'config'
  | 'other';

export interface FileCatalogEntry {
  path: string;
  category: FileCatalogCategory;
  bytes: number;
  lines: number;
  sha256: string;
  modifiedAt: string;
}

export interface IntegrityCheckItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface FileCatalogReport {
  generatedAt: string;
  totalFiles: number;
  totalBytes: number;
  totalLines: number;
  byCategory: Record<string, number>;
  entries: FileCatalogEntry[];
  checks: IntegrityCheckItem[];
  integrityScore: number;
}

export const REQUIRED_CANONICAL_PATHS = [
  'architecture.md',
  'metadata.json',
  'firebase-applet-config.json',
  'firebase-blueprint.json',
  'firestore.rules',
  'server.ts',
  'src/App.tsx',
  'src/firebase.ts',
  'src/canonical/nimbusPrimePrompt.ts',
  'src/canonical/fileCheckCatalog.ts',
  'src/hooks/useWebSpeech.ts',
  'src/packages/vertical-blueprints/schema.ts',
  'src/packages/vertical-blueprints/bots.ts',
  'src/packages/computer-sdk/tools.ts',
  'src/components/NimbusSovereignStudio.tsx',
  'nimbusiq-sovereign-os/01_DOCTRINE/agent_constitution.md',
  'nimbusiq-sovereign-os/04_AGENTS/nimbus_prime/brain.md',
  'nimbusiq-sovereign-os/04_AGENTS/nimbus_prime/brain_state.json',
  'nimbusiq-sovereign-os/09_REFERENCES/mcp_registry.json',
  'nimbusiq-sovereign-os/05_SKILLS/gemini_skills_config.json',
  'nimbusiq-sovereign-os/08_EVALUATIONS/google_partner_mvp_eval.json',
] as const;
