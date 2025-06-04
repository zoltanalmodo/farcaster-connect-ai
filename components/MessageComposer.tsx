import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { initXMTP } from '../lib/xmtp';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const RECIPIENT_ADDRESS = '0x4744e5abF3cbF93d059e2ec4de31DF1B2de81249'; // change to your test partner

export default function MessageComposer() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [lastReceivedMessage, setLastReceivedMessage] = useState('');

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (!isConnected || !walletClient) {
      console.log('🛑 Wallet not connected.');
      return;
    }

    console.log('✅ Wallet connected:', address);
  }, [isConnected, walletClient, address]);

  const handleSend = async () => {
    try {
      if (!message.trim()) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setStatus('Creating XMTP client...');
      const xmtp = await initXMTP(signer);

      const conversation = await xmtp.conversations.newConversation(RECIPIENT_ADDRESS);
      await conversation.send(message);
      setStatus('✅ Message sent! Waiting for reply...');
      setMessage('');
      setSuggestion('');
      setLastReceivedMessage('');

      // Start listening for replies
      for await (const msg of await conversation.streamMessages()) {
        if (msg.senderAddress !== address) {
          console.log('📩 Received reply:', msg.content);
          setLastReceivedMessage(msg.content || '');
          setStatus('📩 Reply received. Click Suggest to get AI help.');
          break; // stop after first reply
        }

      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Error sending message. See console.');
    }
  };

  const handleGetSuggestion = async () => {
    try {
      if (!lastReceivedMessage.trim()) return;

      setStatus('🤖 Fetching suggestion...');
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: lastReceivedMessage }),
      });

      const data = await res.json();
      setSuggestion(data.suggestion || '');
      setStatus('✅ Suggestion received!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to fetch suggestion.');
    }
  };

  return (
    <div className="mb-6">
      <ConnectButton />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message..."
        className="w-full p-2 border rounded mt-4"
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Send
        </button>
        <button
          onClick={handleGetSuggestion}
          disabled={!lastReceivedMessage.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
        >
          Suggest
        </button>
      </div>

      {status && <div className="mt-2 text-sm text-gray-600">{status}</div>}

      {lastReceivedMessage && (
        <div className="mt-4 p-3 border rounded bg-gray-100 text-sm text-gray-800">
          🧑‍💬 <strong>Reply:</strong> {lastReceivedMessage}
        </div>
      )}

      {suggestion && (
        <div className="mt-4 p-3 border rounded bg-yellow-50 text-sm text-gray-900">
          🤖 <strong>AI Suggestion:</strong> {suggestion}
        </div>
      )}
    </div>
  );
}
