import { NextApiRequest, NextApiResponse } from 'next';
import { getAgentKit } from '../../lib/agentkit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const agentKit = await getAgentKit();

    // ✅ Correct method to get all actions
    const actions = agentKit.getActions().map((a: { name: string }) => a.name);

    res.status(200).json({
      message: '✅ AgentKit with actions is ready!',
      actions,
    });
  } catch (err: any) {
    res.status(500).json({
      error: '❌ Failed to load actions',
      details: err.message,
    });
  }
}
