import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

export async function initXMTP(signer: ethers.Signer) {
  const xmtp = await Client.create(signer, { env: 'dev' }); // or 'production' if needed
  return xmtp;
}
