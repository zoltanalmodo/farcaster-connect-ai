import { createPublicClient, http, isAddress } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function resolveIdentity(input: string): Promise<{
  walletAddress: string;
  displayName: string;
  avatarUrl?: string;
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

  let avatarUrl: string | undefined;

  try {
    const avatarResult = await client.getEnsAvatar({ name: input });
    avatarUrl = avatarResult ?? undefined; // explicitly convert null to undefined
  } catch {
    avatarUrl = undefined;
  }

  return {
    walletAddress: address,
    displayName: input,
    avatarUrl,
  };
}
