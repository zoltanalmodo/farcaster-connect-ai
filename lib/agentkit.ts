import { AgentKit } from '@coinbase/agentkit';

let agentKitInstance: AgentKit | null = null;

export async function getAgentKit() {
  if (agentKitInstance) return agentKitInstance;

  const agentKit = await AgentKit.from({
    cdpApiKeyId: process.env.CDP_API_KEY_NAME!,
    cdpApiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY!,
  });

  agentKitInstance = agentKit;
  return agentKit;
}
