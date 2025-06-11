// Suggestions.tsx

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Refine from './Refine';
import { defaultInstruction } from '../lib/defaultInstruction';
import { getContact } from '../lib/ContactStore';

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

    // ✅ Fetch fresh contact data from localStorage
    const freshContact = getContact(recipient);
    if (!freshContact) {
      alert('No contact data found.');
      setLoading(false);
      return;
    }

    const chatHistory = freshContact.chatHistory || [];
    const useAll = freshContact.useAllMessages;
    const scopeCount = freshContact.scopeCount || 5;

    const selectedMessages = useAll
      ? chatHistory
      : chatHistory.slice(-scopeCount);

    const formattedMessages = selectedMessages.map((m) => ({
      sender: m.sender,
      text: m.content,
    }));

    const aboutThem = freshContact.aboutThem || '';
    const myIntentions = freshContact.myIntentions || '';
    const instruction = freshContact.customInstruction || defaultInstruction;
    const toneSettings = freshContact.toneSettings || {};
    const numSuggestions = freshContact.numSuggestions || 5;

    try {
      const res = await fetch('/api/suggest-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedMessages,
          aboutThem,
          myIntentions,
          instruction,
          toneSettings,
          numSuggestions,
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
    <div className={`suggestion-box ${showCustom ? 'purple-box' : 'blue-box'}`}>
      <div className="suggestion-title">
        {showCustom ? 'Refine AI' : 'AI Suggestions'}
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

        <button
          className="refine-button"
          onClick={() => setShowCustom(!showCustom)}
        >
          {showCustom ? 'Done' : 'Refine AI'}
        </button>
      </div>

      {showCustom ? (
        <Refine recipient={recipient} />
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
