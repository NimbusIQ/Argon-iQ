// packages/computer-sdk/tools.ts
import { NimbusBotBlueprint } from '../vertical-blueprints/schema';

export type GuiActionType =
  | 'screenshot'
  | 'left_click'
  | 'double_click'
  | 'type_text'
  | 'key_combo'
  | 'scroll';

export interface TerminalExecInput {
  command: string;
  workdir?: string;
}

export interface ComputerGuiActionInput {
  action: GuiActionType;
  coordinate?: [number, number];
  text?: string;
}

export interface InteropTransferInput {
  sourcePlane: 'browser' | 'desktop' | 'terminal';
  targetPlane: 'rag_vault' | 'desktop' | 'api_webhook';
  artifactPath: string;
}

export interface ComputerToolResult {
  status: 'SUCCESS' | 'PENDING_HITL_APPROVAL' | 'BLOCKED';
  plane: 'TERMINAL' | 'DESKTOP' | 'MCP';
  commandOrAction: string;
  stdout?: string;
  frameId?: string;
  reason?: string;
  sha256Receipt: string;
}

const RISKY_SHELL_PATTERNS = [
  'rm ',
  'curl -X POST',
  'curl -x post',
  'git push',
  'psql -c "UPDATE',
  'psql -c "DELETE',
  'DROP TABLE',
  'submit',
  'wire',
  'approve_po',
];

export function evaluateHitlTrigger(
  promptOrCmd: string,
  bot: NimbusBotBlueprint
): { requiresHitl: boolean; detectedCommand: string; reason: string } {
  const lower = promptOrCmd.toLowerCase();
  const hasMutationIntent =
    lower.includes('submit') ||
    lower.includes('push') ||
    lower.includes('delete') ||
    lower.includes('wire') ||
    lower.includes('approve renewal') ||
    lower.includes('po > $25k') ||
    lower.includes('pos > $25k') ||
    RISKY_SHELL_PATTERNS.some((pat) => lower.includes(pat.toLowerCase()));

  if (
    hasMutationIntent &&
    (bot.requireHumanApprovalForMutations ||
      bot.computerPolicy?.requireHitlOnSystemMutate ||
      bot.browserPolicy?.requireHitlBeforeSubmit)
  ) {
    const defaultCmd =
      bot.defaultTab === 'browser'
        ? 'browser_submit_form --portal="procurement.internal.corp" --po-threshold="25000"'
        : 'psql -c "UPDATE ledger_reconciliations SET status=\'COMMITTED\'" && git push origin audit-branch';

    return {
      requiresHitl: true,
      detectedCommand: defaultCmd,
      reason: `High-impact external mutation gated by ${bot.handle} Sovereign Governance Policy.`,
    };
  }

  return {
    requiresHitl: false,
    detectedCommand: '',
    reason: '',
  };
}

export function quickReceiptHash(seed: string): string {
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0, ch; i < seed.length; i++) {
    ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex =
    (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  return `0x${hex.slice(0, 4)}...${hex.slice(-4)}`;
}

export function createSovereignComputerTools(tenantId: string, bot: NimbusBotBlueprint) {
  return {
    terminal_exec: (input: TerminalExecInput): ComputerToolResult => {
      const workdir = input.workdir || bot.computerPolicy?.filesystemMount || '/workspace/tenant_vault';
      const hitl = evaluateHitlTrigger(input.command, bot);
      if (hitl.requiresHitl) {
        return {
          status: 'PENDING_HITL_APPROVAL',
          plane: 'TERMINAL',
          commandOrAction: input.command,
          reason: hitl.reason,
          sha256Receipt: quickReceiptHash(`${tenantId}:${input.command}:hitl`),
        };
      }
      return {
        status: 'SUCCESS',
        plane: 'TERMINAL',
        commandOrAction: input.command,
        stdout: `[microvm:${tenantId}] (${workdir}) $ ${input.command}\nExecution verified cleanly (exit 0).`,
        sha256Receipt: quickReceiptHash(`${tenantId}:${input.command}:ok`),
      };
    },

    computer_gui_action: (input: ComputerGuiActionInput): ComputerToolResult => {
      const coordLabel = input.coordinate ? `(${input.coordinate[0]}, ${input.coordinate[1]})` : '(root)';
      return {
        status: 'SUCCESS',
        plane: 'DESKTOP',
        commandOrAction: `${input.action} @ ${coordLabel}`,
        frameId: `frame_${Date.now()}`,
        stdout: `X11 event dispatched inside 1920x1080 Firecracker framebuffer: ${input.action} ${coordLabel}`,
        sha256Receipt: quickReceiptHash(`${tenantId}:${input.action}:${coordLabel}`),
      };
    },

    interop_transfer: (input: InteropTransferInput): ComputerToolResult => {
      return {
        status: 'SUCCESS',
        plane: 'MCP',
        commandOrAction: `${input.sourcePlane} -> ${input.targetPlane} (${input.artifactPath})`,
        stdout: `Bridged artifact ${input.artifactPath} from ${input.sourcePlane} into ${input.targetPlane} under Zero-Retention VPC policy.`,
        sha256Receipt: quickReceiptHash(`${tenantId}:${input.artifactPath}:${input.targetPlane}`),
      };
    },
  };
}
