import { useState, useRef, useEffect } from 'react';
import { useClient } from '@xmtp/react-sdk';
import { useAccount } from 'wagmi';

interface Suggestion {
  text: string;
  reason: string;
}

export default function Suggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [customInstruction, setCustomInstruction] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [scopeCount, setScopeCount] = useState(10);
  const [useAllMessages, setUseAllMessages] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { address } = useAccount();
  const xmtpClient = useClient();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [customInstruction, showCustom]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);

    const chatMessagesRaw = sessionStorage.getItem('chatMessages');
    const chatMessages = chatMessagesRaw ? JSON.parse(chatMessagesRaw) : [];

    const selectedMessages = useAllMessages
      ? chatMessages
      : chatMessages.slice(-scopeCount);

    const formattedMessages = selectedMessages.map((m: string) => {
      const sender = m.startsWith('You:') ? 'user' : 'them';
      const text = m.replace(/^You: |^Them: /, '');
      return { sender, text };
    });

    const aboutThem = localStorage.getItem('aboutThem') || '';
    const myIntentions = localStorage.getItem('myIntentions') || '';

    const res = await fetch('/api/suggest-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: formattedMessages,
        aboutThem,
        myIntentions,
      }),
    });

    const data = await res.json();

    const mapped = Array.isArray(data.suggestions)
      ? data.suggestions.map((s: string) => ({
          text: s.trim(),
          reason: `Tone based on "${myIntentions}" and what you know about them.`,
        }))
      : [];

    setSuggestions(mapped);
    setLoading(false);
  };

  const sendViaXMTP = async (message: string) => {
    try {
      const recipientAddress = localStorage.getItem('recipientAddress') || '';

      if (!xmtpClient.client || !recipientAddress) {
        alert('Missing XMTP client or recipient');
        return;
      }

      const conversation = await xmtpClient.client.conversations.newConversation(recipientAddress);
      await conversation.send(message);
      alert('✅ Message sent via XMTP!');
    } catch (err) {
      console.error('❌ Failed to send via XMTP:', err);
      alert('Error sending message.');
    }
  };


  return (
    <div className={`suggestion-box ${showCustom ? 'purple-box' : 'blue-box'}`}>
      <div className="suggestion-title">
        {showCustom ? 'Refine AI' : 'AI Suggestions'}
      </div>

      <div
        className="suggestion-controls"
        style={{ justifyContent: showCustom ? 'flex-end' : 'space-between' }}
      >
        {!showCustom && (
          <button className="get-button" onClick={fetchSuggestions} disabled={loading}>
            {loading ? 'Thinking...' : 'Get Suggestions'}
          </button>
        )}
        <button className="refine-button" onClick={() => setShowCustom(!showCustom)}>
          {showCustom ? 'Done' : 'Refine AI'}
        </button>
      </div>

      {showCustom ? (
        <>
          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="instruction" style={{ fontWeight: 'bold' }}>
              Customize AI Behavior:
            </label>
            <textarea
              id="instruction"
              ref={textareaRef}
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="Enter your own AI prompt..."
              style={{
                width: '100%',
                marginTop: '0.5rem',
                resize: 'none',
                overflow: 'hidden',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #ccc',
                fontFamily: 'inherit',
                fontSize: '1rem',
                boxSizing: 'border-box',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
              }}
            />
          </div>

          <div
            className="scope-controls"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <label>
              Take last{' '}
              <input
                type="number"
                min="1"
                max="100"
                value={scopeCount}
                onChange={(e) => setScopeCount(Number(e.target.value))}
                disabled={useAllMessages}
              />{' '}
              messages
            </label>

            <label>
              <input
                type="checkbox"
                checked={useAllMessages}
                onChange={() => setUseAllMessages(!useAllMessages)}
              />{' '}
              Use all messages for sampling
            </label>
          </div>
        </>
      ) : (
        <div className="suggestion-output" style={{ marginTop: '1rem' }}>
          {suggestions.length === 0 && !loading && <p>No suggestions yet.</p>}
          {suggestions.map((s, index) => (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <strong>💬 {s.text}</strong>
              <br />
              <em>🧠 {s.reason}</em>
              <br />
              <button
                className="send-xmtp-button"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  background: '#ff4081',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => sendViaXMTP(s.text)}
              >
                ✉️ Send this answer via XMTP
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
