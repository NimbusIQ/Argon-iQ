// ─── Model Configuration ──────────────────────────────────────────────────────
// The existing OpenAI assistant panel uses this model.
// The new NimbusChat widget uses Gemini directly via /api/gemini_chat.
export const MODEL = "gpt-4o-mini";

// ─── Developer Prompt (OpenAI assistant panel) ────────────────────────────────
export const DEVELOPER_PROMPT = `
You are NimbusIQ — the AI assistant for Nimbus Roofing, McKinney's premier GAF Master Elite certified roofing contractor.
You specialize in hail damage detection, insurance claim supplements, and roof replacements across North Texas.

If a homeowner asks about their roof or storm damage, help them understand their options.
If they need up-to-date storm data, use the web search tool.
If they mention their address, property, or prior conversations, use the save_context or file search tools.

Always recommend calling (214) 612-6696 or requesting a free inspection at nimbusroofing.com.
`;

// ─── Initial Message (OpenAI assistant panel) ─────────────────────────────────
export const INITIAL_MESSAGE = `
Hi! I'm NimbusIQ, your AI roofing assistant. I can help with hail damage assessments, insurance claims, and roof inspections across McKinney & DFW. How can I help you today?
`;

// ─── Default Vector Store ─────────────────────────────────────────────────────
export const defaultVectorStore = {
  id: "",
  name: "NimbusIQ Knowledge Base",
};
