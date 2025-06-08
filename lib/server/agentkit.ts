// lib/server/agentkit.ts
import { AgentKit } from '@coinbase/agentkit';

const { identityTool } = require('@coinbase/agentkit/tools/identity');

let agentKitInstance: AgentKit | null = null;

export async function getAgentKit() {
  if (agentKitInstance) return agentKitInstance;

  const agentKit = await AgentKit.from({
    cdpApiKeyId: process.env.CDP_API_KEY_NAME!,
    cdpApiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY!,
    tools: [identityTool], // ✅ runtime-safe
  } as any); // ⛏ override TS type mismatch

  agentKitInstance = agentKit;
  return agentKit;
}
