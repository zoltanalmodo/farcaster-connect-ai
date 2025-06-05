import { useEffect, useState, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { initXMTP } from '../lib/xmtp';

const SEND_ADDRESS = '0x4744e5abf3cbf93d059e2ec4de31df1b2de81249';
const REPLY_ADDRESS = '0x0832CE6C215B079e665b99cB1F27C9A2d4E0226B';

const findExistingConversation = async (xmtp: any, recipientAddress: string) => {
  const conversations = await xmtp.conversations.list();
  return conversations.find(
    (c: any) => c.peerAddress?.toLowerCase() === recipientAddress.toLowerCase()
  );
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [xmtpClient, setXmtpClient] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (!isConnected || !walletClient) return;

    const startXMTP = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const xmtp = await initXMTP(signer);
      setXmtpClient(xmtp);

      const recipientAddress =
        address?.toLowerCase() === SEND_ADDRESS.toLowerCase()
          ? REPLY_ADDRESS
          : SEND_ADDRESS;

      const existing = await findExistingConversation(xmtp, recipientAddress);
      const conversation = existing ?? await xmtp.conversations.newConversation(recipientAddress);

      for await (const msg of await conversation.streamMessages()) {
        setMessages((prev) => [...prev, msg]);
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    startXMTP();
  }, [isConnected, walletClient, address]);

  const handleSend = async () => {
    if (!message.trim() || !xmtpClient) return;

    const recipientAddress =
      address?.toLowerCase() === SEND_ADDRESS.toLowerCase()
        ? REPLY_ADDRESS
        : SEND_ADDRESS;

    const existing = await findExistingConversation(xmtpClient, recipientAddress);
    const conversation = existing ?? await xmtpClient.conversations.newConversation(recipientAddress);

    const sentMsg = await conversation.send(message);
    setMessages((prev) => [...prev, sentMsg]);
    setMessage('');
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });

    setStatus('✅ Message sent!');
  };

  const handleGetSuggestion = async () => {
    const lastMessage = messages.findLast((msg) => msg.senderAddress !== address);
    if (!lastMessage?.content) return;

    setStatus('🤖 Fetching suggestion...');
    const res = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: lastMessage.content }),
    });

    const data = await res.json();
    setSuggestion(data.suggestion || '');
    setStatus('✅ Suggestion ready.');
  };

  return (
    <div className="mb-6">
      <ConnectButton />

      <div className="border p-4 mt-4 h-64 overflow-y-auto bg-white rounded shadow">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 text-sm ${
              msg.senderAddress === address ? 'text-right text-blue-600' : 'text-left text-gray-800'
            }`}
          >
            <div className="inline-block px-2 py-1 border rounded bg-gray-100 max-w-xs break-words">
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message..."
        className="w-full p-2 border rounded mt-2"
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
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Suggest
        </button>
      </div>

      {status && <div className="mt-2 text-sm text-gray-600">{status}</div>}

      {suggestion && (
        <div className="mt-4 p-3 border rounded bg-yellow-50 text-sm text-gray-900">
          🤖 <strong>AI Suggestion:</strong> {suggestion}
        </div>
      )}
    </div>
  );
}
