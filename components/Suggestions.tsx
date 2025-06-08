import { useState } from 'react';
import { useAccount } from 'wagmi';
import Refine from './Refine';

const SEND_ADDRESS = process.env.NEXT_PUBLIC_SEND_ADDRESS!;
const REPLY_ADDRESS = process.env.NEXT_PUBLIC_REPLY_ADDRESS!;

interface Suggestion {
  text: string;
  reason: string;
}

export default function Suggestions({
  xmtpClient,
  signer,
}: {
  xmtpClient: any;
  signer: any;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showCustom, setShowCustom] = useState(false);

  const { address } = useAccount();

  const sendViaXMTP = async (message: string) => {
    try {
      if (!xmtpClient || !address) {
        console.error('Missing XMTP Client or wallet address');
        alert('Missing XMTP client or wallet address');
        return;
      }

      const recipient =
        address.toLowerCase() === SEND_ADDRESS.toLowerCase()
          ? REPLY_ADDRESS
          : SEND_ADDRESS;

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
          <button
            className="get-button"
            onClick={() => document.dispatchEvent(new Event('fetch-suggestions'))}
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Get Suggestions'}
          </button>
        )}
        <button className="refine-button" onClick={() => setShowCustom(!showCustom)}>
          {showCustom ? 'Done' : 'Refine AI'}
        </button>
      </div>

      {showCustom ? (
        <Refine setSuggestions={setSuggestions} setLoading={setLoading} />
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
