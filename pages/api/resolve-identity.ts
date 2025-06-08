// pages/api/resolve-identity.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { AgentKit } from '@coinbase/agentkit';

const identityTool = {
  name: 'resolve-identity',
  description: 'Resolve an identifier into a full identity profile',
  inputSchema: {
    type: 'object',
    properties: {
      identifier: {
        type: 'string',
        description: 'The handle to resolve',
      },
    },
    required: ['identifier'],
  },
  async run(agentKit: any, input: { identifier: string }) {
    const result = await fetch('https://api.agentkit.xyz/identity/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': process.env.CDP_API_KEY_NAME!,
        'X-API-Key-Secret': process.env.CDP_API_KEY_PRIVATE_KEY!,
      },
      body: JSON.stringify(input),
    });

    return result.json();
  },
};

const agentKitPromise = AgentKit.from({
  cdpApiKeyId: process.env.CDP_API_KEY_NAME!,
  cdpApiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { identifier } = req.body;
    const agentKit = await agentKitPromise;

    const result = await identityTool.run(agentKit, { identifier });

    res.status(200).json(result);
  } catch (err) {
    console.error('❌ Identity resolution failed:', err);
    res.status(500).json({ error: 'Identity resolution failed' });
  }
}
