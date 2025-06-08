// lib/agentkit.ts
import { createPublicClient, http, isAddress } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function resolveIdentity(input: string): Promise<{
  walletAddress: string;
  displayName: string;
}> {
  let address: string | null = null;

  try {
    address = isAddress(input)
      ? input
      : await client.getEnsAddress({ name: input });
  } catch {
    console.error('❌ ENS resolution failed for:', input);
  }

  if (!address) {
    throw new Error('❌ Invalid ENS or address');
  }

  return {
    walletAddress: address,
    displayName: input,
  };
}
