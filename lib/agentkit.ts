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

/**
 * Fallback identity resolver.
 * Replace with real ENS/Farcaster logic later.
 */
export async function resolveIdentity(input: string): Promise<{
  walletAddress: string;
  displayName: string;
  avatarUrl?: string;
  profileBio?: string;
}> {
  let address = input;
  let displayName = input;
  let avatarUrl = '';
  let profileBio = '';

  // 👇 If it's not a valid address, mock one (simulate ENS/Farcaster resolution)
  if (!isAddress(input)) {
    address = '0x' + Math.random().toString(16).substring(2, 42);
  }

  return {
    walletAddress: address,
    displayName,
    avatarUrl: 'https://placekitten.com/40/40',
    profileBio: 'This is a mock identity. Real resolution coming soon.',
  };
}
