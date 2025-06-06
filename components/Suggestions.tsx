import { useEffect, useState } from 'react';

interface Suggestion {
  text: string;
  reason: string;
}

export default function Suggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState('');

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);
    setError('');

    try {
      // Get real chat messages from sessionStorage
      const messages = JSON.parse(sessionStorage.getItem('chatMessages') || '[]');

      // Get real notes from localStorage
      const peerAddress = '0x0832CE6C215B079e665b99cB1F27C9A2d4E0226B'; // Or make this dynamic
      const noteData = JSON.parse(localStorage.getItem(`notes-${peerAddress}`) || '{}');
      const intentions = noteData.intentions || '';
      const aboutThem = noteData.personalNotes || '';

      const context = `
Recent chat messages:
${messages.slice(-5).map((m: string) => `- ${m}`).join('\n')}

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

      if (data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        setError('⚠️ AI response malformed.');
      }
    } catch (err) {
      console.error(err);
      setError('⚠️ Failed to fetch AI suggestions.');
    } finally {
      setLoading(false);
    }
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!error && suggestions.length === 0 && !loading && <p>No suggestions yet.</p>}

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
