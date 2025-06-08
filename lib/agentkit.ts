// lib/agentkit.ts
import { isAddress } from 'viem';

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
  const handle = input.startsWith('@') ? input.slice(1) : input;

  try {
    const res = await fetch('/api/resolve-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: handle }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const result = await res.json();

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
