// pages/api/suggest-agent.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAgentSuggestions } from '@/lib/suggest-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const {
      address,
      messages,
      aboutThem,
      aboutMe,
      myIntentions,
      aiObservationsAboutThem,
      aiObservationsAboutMe,
      customInstruction,
      toneSettings,
      numSuggestions,
      useAllMessages,
    } = req.body;

    const result = await getAgentSuggestions({
      address,
      messages,
      useAllMessages,
      numSuggestions,
      contactContext: {
        aboutThem,
        myIntentions,
        tone: toneSettings,
        // add optional fields if needed
      },
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('❌ /api/suggest-agent error:', err);
    res.status(500).json({ error: 'AgentKit suggestion failed.' });
  }
}
