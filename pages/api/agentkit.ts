// pages/api/agentkit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAgentKit } from '../../lib/agentkit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const agentKit = await getAgentKit();
    res.status(200).json({ message: 'AgentKit is ready!' });
  } catch (err: any) {
    console.error('AgentKit init failed:', err);
    res.status(500).json({ error: 'AgentKit setup failed', details: err.message });
  }
}
