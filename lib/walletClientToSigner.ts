// lib/walletClientToSigner.ts
import { WalletClient } from 'viem';
import { providers, Signer } from 'ethers';

export function walletClientToSigner(walletClient: WalletClient): Signer {
  if (!walletClient.account) {
    throw new Error('Wallet client has no account');
  }

  const provider = new providers.Web3Provider(walletClient as any); // compatible EIP-1193 shim
  return provider.getSigner(walletClient.account.address);
}
