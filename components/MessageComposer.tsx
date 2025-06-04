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

export default function MessageComposer() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [suggestion, setSuggestion] = useState('');

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
      if (!message) return;

      if (!window.ethereum) {
        alert('Please install MetaMask or another Ethereum wallet.');
        return;
      }

      if (!walletClient) {
        alert('Wallet not connected.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      setStatus('Creating XMTP client...');
      const xmtp = await initXMTP(signer);

      setStatus('Starting new conversation...');
      const conversation = await xmtp.conversations.newConversation(
        '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
      );

      await conversation.send(message);
      setMessage('');
      setStatus('✅ Message sent!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Error sending message. See console.');
    }
  };

  const handleGetSuggestion = async () => {
    try {
      setStatus('🤖 Fetching suggestion...');
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
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
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
        <button
          onClick={handleGetSuggestion}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Suggest
        </button>
      </div>

      {status && <div className="mt-2 text-sm text-gray-600">{status}</div>}

      {suggestion && (
        <div className="mt-4 p-3 border rounded bg-gray-50 text-sm text-gray-800">
          🤖 <strong>AI Suggestion:</strong> {suggestion}
        </div>
      )}
    </div>
  );
}
