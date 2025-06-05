// lib/xmtp.ts
import { Client } from '@xmtp/xmtp-js';
import { Signer } from 'ethers';

export const initXMTP = async (signer: Signer) => {
  const xmtp = await Client.create(signer, {
    env: 'production',
    persistConversations: false,  // optional, helps avoid cache
    skipContactPublishing: false  // important: allows publishing
  });

  return xmtp;
};
