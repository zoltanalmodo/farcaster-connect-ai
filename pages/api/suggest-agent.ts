import type { NextApiRequest, NextApiResponse } from 'next';
import { getAgentKit } from '../../lib/agentkit';
import { openaiSuggestTool } from '../../lib/openaiTool';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages, aboutThem, myIntentions } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  try {
    await getAgentKit(); // just ensures initialized, if needed

    const result = await openaiSuggestTool.run({
      messages,
      context: {
        aboutThem,
        myIntentions,
      },
    });

    res.status(200).json(result);
  } catch (err: any) {
    console.error('AgentKit suggest failed:', err);
    res.status(500).json({ error: 'AgentKit suggest failed', details: err.message });
  }
}
