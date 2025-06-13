// lib/suggest-agent.ts
import { openaiSuggestTool } from '@/lib/openaiTool';
import type { ChatEntry, ToneSettings } from '@/lib/ContactStore';

type SuggestAgentOptions = {
  address: string;
  contactContext: {
    aboutThem: string;
    myIntentions: string;
    tone?: ToneSettings;
  };
  messages: ChatEntry[];
  numSuggestions: number;
  useAllMessages: boolean;
};

export async function getAgentSuggestions({
  address,
  contactContext,
  messages,
  numSuggestions,
  useAllMessages,
}: SuggestAgentOptions) {
  const recentMessages = useAllMessages ? messages : messages.slice(-5);
  const formattedMessages = recentMessages.map((msg) => ({
    sender: msg.sender === 'user' ? 'user' : 'them',
    text: msg.content,
  }));

  const input = {
    messages: formattedMessages,
    context: {
      aboutThem: contactContext.aboutThem,
      myIntentions: contactContext.myIntentions,
    },
  };

  // ✅ Directly call the OpenAI-powered tool
  const result = await openaiSuggestTool.run(input);

  try {
    return Array.isArray(result.output)
      ? result.output
      : JSON.parse(result.output || '[]');
  } catch (err) {
    console.error('❌ Failed to parse tool output:', result.output);
    return [];
  }
}
