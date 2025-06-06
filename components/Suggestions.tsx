import { useState } from 'react';
import { useChatMessages } from '../lib/useChatMessages'; // 🔹 You'll create this
import { useNotes } from '../lib/useNotes'; // 🔹 You'll create this

interface Suggestion {
  text: string;
  reason: string;
}

export default function Suggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const chatMessages = useChatMessages();
  const { intentions, aboutThem } = useNotes();

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);

    const context = `
Recent chat messages:
${chatMessages.map((msg) => `- ${msg}`).join('\n')}

My notes:
About Them:
${aboutThem}

My Intentions:
${intentions}

What’s a good message to send next?
`;

    const res = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: context }),
    });

    const data = await res.json();
    setSuggestions(data.suggestions || []);
    setLoading(false);
  };

  return (
    <div className="suggestion-box">
      <div className="suggestion-title">AI Suggestions</div>

      <div className="suggestion-button">
        <button onClick={fetchSuggestions} disabled={loading}>
          {loading ? 'Thinking...' : 'Get Suggestion'}
        </button>
      </div>

      <div className="suggestion-output">
        {suggestions.length === 0 && !loading && <p>No suggestions yet.</p>}

        {suggestions.map((s, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <strong>💬 {s.text}</strong>
            <br />
            <em>🧠 {s.reason}</em>
          </div>
        ))}
      </div>
    </div>
  );
}
