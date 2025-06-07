import type { NextApiRequest, NextApiResponse } from 'next'; // ✅ missing import
import { openaiSuggestTool } from '../../lib/openaiTool';     // ✅ missing import

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages, aboutThem, myIntentions } = req.body;

  console.log('📦 Incoming payload:', {
    messages,
    aboutThem,
    myIntentions,
  });

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  try {
    const result = await openaiSuggestTool.run({
      messages,
      context: { aboutThem, myIntentions },
    });

    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Suggestion generation failed:', err);
    res.status(500).json({ error: 'AgentKit suggest failed', details: err.message });
  }
}
