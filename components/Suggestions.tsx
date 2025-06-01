import { useState } from 'react';

export default function Suggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const fetchSuggestion = async () => {
    setLoading(true);
    setSuggestion('');

    const prompt = `Suggest a thoughtful message, a small crypto gift idea, and a shared activity for two Farcaster users who are into NFTs, climbing, and music.`;

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    setSuggestion(data.reply || 'No response from AI');
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">AI Suggestions</h2>
      <button
        onClick={fetchSuggestion}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded"
        disabled={loading}
      >
        {loading ? 'Thinking...' : 'Get Suggestion'}
      </button>
      <div className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
        {suggestion}
      </div>
    </div>
  );
}
