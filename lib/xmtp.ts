import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

export async function initXMTP(signer: ethers.Signer) {
  const xmtp = await Client.create(signer, {
    env: 'dev', // you're using XMTP.dev, this is correct
  });

  console.log('✅ XMTP identity:', await signer.getAddress());

  return xmtp;
}
