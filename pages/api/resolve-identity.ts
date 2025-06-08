// pages/api/resolve-identity.ts
import type { NextApiRequest, NextApiResponse } from 'next';

if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_KEY_PRIVATE_KEY) {
  throw new Error('❌ Missing CDP API credentials in environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { identifier } = req.body;

    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid identifier' });
    }

    const response = await fetch('https://api.agentkit.xyz/identity/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': process.env.CDP_API_KEY_NAME!,
        'X-API-Key-Secret': process.env.CDP_API_KEY_PRIVATE_KEY!,
      },
      body: JSON.stringify({ identifier }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AgentKit API error: ${response.status} - ${text}`);
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Identity resolution failed:', err);
    res.status(500).json({ error: 'Identity resolution failed', details: err.message });
  }
}
