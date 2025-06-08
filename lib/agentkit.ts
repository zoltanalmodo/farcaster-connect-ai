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

// 👇 Manually define identityTool (as per AgentKit 0.8.0 format)
const identityTool = {
  name: 'resolve-identity',
  description: 'Resolves a handle or ENS to full identity metadata.',
  run: async (agentKit: AgentKit, { identifier }: { identifier: string }) => {
    const res = await fetch(`https://api.airstack.xyz/identity/${identifier}`, {
      headers: {
        'x-api-key': process.env.CDP_API_KEY_PRIVATE_KEY!,
      },
    });

    if (!res.ok) throw new Error('Failed to resolve identity');
    return res.json();
  },
};

export async function resolveIdentity(input: string): Promise<{
  walletAddress: string;
  displayName: string;
  avatarUrl?: string;
  profileBio?: string;
  ens?: string;
  farcaster?: string;
  twitter?: string;
  followerCount?: number;
}> {
  const agentKit = await getAgentKit();
  const handle = input.startsWith('@') ? input.slice(1) : input;

  try {
    const result = await identityTool.run(agentKit, { identifier: handle });

    return {
      walletAddress: result.walletAddress,
      displayName: result.displayName || handle,
      avatarUrl: result.avatarUrl || '',
      profileBio: result.profileBio || '',
      ens: result.ens || '',
      farcaster: result.farcaster || '',
      twitter: result.twitter || '',
      followerCount: result.followerCount ?? undefined,
    };
  } catch (err) {
    console.error('❌ Identity resolution failed:', err);

    return {
      walletAddress: isAddress(input)
        ? input
        : '0x' + Math.random().toString(16).substring(2, 42),
      displayName: input,
      avatarUrl: 'https://placekitten.com/40/40',
      profileBio: 'Unable to resolve identity.',
    };
  }
}
