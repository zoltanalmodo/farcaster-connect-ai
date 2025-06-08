import { AgentKit } from '@coinbase/agentkit';
import { isAddress } from 'viem';

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

export async function resolveIdentity(input: string): Promise<{
  walletAddress: string;
  displayName: string;
  avatarUrl?: string;
  profileBio?: string;
}> {
  const handle = input.startsWith('@') ? input.slice(1) : input;

  return {
    walletAddress: isAddress(handle)
      ? handle
      : '0x' + Math.random().toString(16).substring(2, 42),
    displayName: handle,
    avatarUrl: 'https://placekitten.com/40/40',
    profileBio: 'This is a mock identity until full resolution is added.',
  };
}
