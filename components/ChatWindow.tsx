import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

interface ChatMessage {
  id: string;
  senderAddress: string;
  content: string;
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

  useEffect(() => {
    // 🛑 Clear messages if no recipient selected
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

      // ✅ Save messages scoped to recipient
      sessionStorage.setItem(
        `chatMessages-${recipient}`,
        JSON.stringify(pastMessages.map((m) => m.content))
      );

      for await (const msg of await conversation.streamMessages()) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              m.id === msg.id ||
              (m.content === msg.content && m.senderAddress === msg.senderAddress)
          );
          const updated = exists ? prev : [...prev, msg];

          sessionStorage.setItem(
            `chatMessages-${recipient}`,
            JSON.stringify(updated.map((m) => m.content))
          );

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
