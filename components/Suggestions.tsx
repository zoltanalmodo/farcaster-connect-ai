import { useState } from 'react';
import { useAccount } from 'wagmi';
import Refine from './Refine';
import ToneControls from './ToneControls';
import { defaultInstruction } from '../lib/defaultInstruction';

interface Suggestion {
  text: string;
  reason: string;
}

export default function Suggestions({
  xmtpClient,
  signer,
  recipient,
}: {
  xmtpClient: any;
  signer: any;
  recipient: string;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showCustom, setShowCustom] = useState(false);
  const [showTonePanel, setShowTonePanel] = useState(false);
  const { address } = useAccount();

  const sendViaXMTP = async (message: string) => {
    try {
      if (!xmtpClient || !address || !recipient) {
        console.error('Missing XMTP Client, wallet address, or recipient');
        alert('Missing XMTP client, wallet address, or recipient');
        return;
      }

      const existing = (await xmtpClient.conversations.list()).find(
        (c: any) => c.peerAddress.toLowerCase() === recipient.toLowerCase()
      );

      const conversation =
        existing ?? (await xmtpClient.conversations.newConversation(recipient));

      await conversation.send(message);
      alert('✅ Message sent via XMTP!');
    } catch (err) {
      console.error('❌ Failed to send via XMTP:', err);
      alert('Error sending message.');
    }
  };

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);

    if (!recipient) {
      alert('Please select a contact first.');
      setLoading(false);
      return;
    }

    // ✅ Load only messages scoped to selected recipient
    const chatMessagesRaw = sessionStorage.getItem(`chatMessages-${recipient}`);
    const chatMessages = chatMessagesRaw ? JSON.parse(chatMessagesRaw) : [];

    const scopeCount = Number(localStorage.getItem('scopeCount')) || 5;
    const useAllMessages = localStorage.getItem('useAllMessages') === 'true';

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
    const instruction = localStorage.getItem('customInstruction') || defaultInstruction;

    try {
      const res = await fetch('/api/suggest-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedMessages,
          aboutThem,
          myIntentions,
          instruction,
        }),
      });

      const data = await res.json();
      const mapped = Array.isArray(data)
        ? data.map((s: any) => ({
            text: s.text?.trim() || '',
            reason: s.explanation?.trim() || 'No explanation provided by AI.',
          }))
        : [];

      setSuggestions(mapped);
    } catch (err) {
      console.error('❌ Failed to fetch suggestions:', err);
      alert('Error fetching suggestions.');
    }

    setLoading(false);
  };

  return (
    <div
      className={`suggestion-box ${
        showCustom && !showTonePanel
          ? 'purple-box'
          : showTonePanel
          ? 'orange-box'
          : 'blue-box'
      }`}
    >
      <div className="suggestion-title">
        {showTonePanel ? 'Tone Controls' : showCustom ? 'Refine AI' : 'AI Suggestions'}
      </div>

      <div
        className="suggestion-controls"
        style={{
          justifyContent: showCustom ? 'flex-end' : 'space-between',
          gap: '0.5rem',
        }}
      >
        {!showCustom && (
          <button className="get-button" onClick={fetchSuggestions} disabled={loading}>
            {loading ? 'Thinking...' : 'Get Suggestions'}
          </button>
        )}

        {showCustom && !showTonePanel && (
          <button className="orange-button" onClick={() => setShowTonePanel(true)}>
            Tone AI
          </button>
        )}

        <button
          className="refine-button"
          onClick={() => {
            setShowCustom(!showCustom);
            setShowTonePanel(false);
          }}
        >
          {showCustom ? 'Done' : 'Refine AI'}
        </button>
      </div>

      {showCustom ? (
        showTonePanel ? (
          <ToneControls onDone={() => setShowTonePanel(false)} />
        ) : (
          <Refine setSuggestions={setSuggestions} setLoading={setLoading} />
        )
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
