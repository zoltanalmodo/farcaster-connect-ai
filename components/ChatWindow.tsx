import { useEffect, useRef, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { initXMTP } from '../lib/xmtp';

const SEND_ADDRESS = '0x4744e5abf3cbf93d059e2ec4de31df1b2de81249';
const REPLY_ADDRESS = '0x0832CE6C215B079e665b99cB1F27C9A2d4E0226B';

export default function ChatWindow() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [xmtpClient, setXmtpClient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isConnected || !walletClient) return;

    const startXMTP = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const xmtp = await initXMTP(signer);
      setXmtpClient(xmtp);

      const recipient = address?.toLowerCase() === SEND_ADDRESS.toLowerCase()
        ? REPLY_ADDRESS
        : SEND_ADDRESS;

      const existing = (await xmtp.conversations.list()).find(
        (c: any) => c.peerAddress?.toLowerCase() === recipient.toLowerCase()
      );

      const conversation = existing ?? await xmtp.conversations.newConversation(recipient);

      const pastMessages = await conversation.messages();
      setMessages(pastMessages);

      for await (const msg of await conversation.streamMessages()) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id);
          return exists ? prev : [...prev, msg];
        });
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    startXMTP();
  }, [isConnected, walletClient, address]);

  const handleSend = async () => {
    if (!message.trim() || !xmtpClient) return;

    const recipient = address?.toLowerCase() === SEND_ADDRESS.toLowerCase()
      ? REPLY_ADDRESS
      : SEND_ADDRESS;

    const existing = (await xmtpClient.conversations.list()).find(
      (c: any) => c.peerAddress?.toLowerCase() === recipient.toLowerCase()
    );

    const conversation = existing ?? await xmtpClient.conversations.newConversation(recipient);

    await conversation.send(message);
    setMessage('');
    setStatus('✅ Message sent!');
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, idx) => {
            const isSender = msg.senderAddress === address;
            return (
              <div
                key={msg.id || idx}
                className={`chat-bubble ${isSender ? 'sender' : 'receiver'}`}
              >
                {msg.content}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-controls">
          <textarea
            className="chat-input"
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="chat-buttons">
            <button onClick={handleSend} disabled={!message.trim()}>
              Send
            </button>
          </div>
        </div>

        {status && <div className="chat-status">{status}</div>}
      </div>
    </>
  );
}
