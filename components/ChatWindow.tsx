// components/ChatWindow.tsx
import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useContactData } from '../hooks/useContactData';
import { appendMessageToHistory } from '../lib/ContactStore';

interface ChatMessage {
  id: string;
  senderAddress: string;
  content: string;
  sent?: Date; // Optional if not always available
}

export default function ChatWindow({
  xmtpClient,
  signer,
  recipient,
}: {
  xmtpClient: any;
  signer: any;
  recipient: string;
}) {
  const { address } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { setContactData } = useContactData(recipient);

  useEffect(() => {
    if (!xmtpClient || !signer || !address || !recipient) {
      setMessages([]);
      return;
    }

    const loadConversation = async () => {
      const existing = (await xmtpClient.conversations.list()).find(
        (c: any) => c.peerAddress?.toLowerCase() === recipient.toLowerCase()
      );

      const conversation =
        existing ?? (await xmtpClient.conversations.newConversation(recipient));

      const pastMessages: ChatMessage[] = await conversation.messages();
      setMessages(pastMessages);

      // ✅ Save to ContactStore as last 50 messages
      const formatted = pastMessages.map((msg) => ({
        sender: msg.senderAddress === address ? ('user' as const) : ('them' as const),
        content: msg.content,
        timestamp: msg.sent ? new Date(msg.sent).getTime() : Date.now(),
      }));

      setContactData({ chatHistory: formatted.slice(-50) });

      for await (const msg of await conversation.streamMessages()) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              m.id === msg.id ||
              (m.content === msg.content && m.senderAddress === msg.senderAddress)
          );
          const updated = exists ? prev : [...prev, msg];

          // ✅ Append to chat history
          appendMessageToHistory(recipient, {
            sender: msg.senderAddress === address ? ('user' as const) : ('them' as const),
            content: msg.content,
            timestamp: msg.sent ? new Date(msg.sent).getTime() : Date.now(),
          });

          return updated;
        });

        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    loadConversation();
  }, [xmtpClient, signer, address, recipient]);

  const handleSend = async () => {
    if (!message.trim() || !xmtpClient || !address || !recipient) return;

    const existing = (await xmtpClient.conversations.list()).find(
      (c: any) => c.peerAddress?.toLowerCase() === recipient.toLowerCase()
    );

    const conversation =
      existing ?? (await xmtpClient.conversations.newConversation(recipient));

    await conversation.send(message);

    appendMessageToHistory(recipient, {
      sender: 'user',
      content: message,
      timestamp: Date.now(),
    });

    setMessage('');
    setStatus('✅ Message sent!');
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
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
  );
}
