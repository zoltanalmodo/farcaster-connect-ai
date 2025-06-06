import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

const SEND_ADDRESS = '0x4744e5abf3cbf93d059e2ec4de31df1b2de81249';
const REPLY_ADDRESS = '0x0832CE6C215B079e665b99cB1F27C9A2d4E0226B';

interface ChatMessage {
  id: string;
  senderAddress: string;
  content: string;
}

export default function ChatWindow({
  xmtpClient,
  signer,
}: {
  xmtpClient: any;
  signer: any;
}) {
  const { address } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!xmtpClient || !signer || !address) return;

    const loadConversation = async () => {
      const recipient =
        address.toLowerCase() === SEND_ADDRESS.toLowerCase()
          ? REPLY_ADDRESS
          : SEND_ADDRESS;

      const existing = (await xmtpClient.conversations.list()).find(
        (c: any) => c.peerAddress?.toLowerCase() === recipient.toLowerCase()
      );

      const conversation =
        existing ?? (await xmtpClient.conversations.newConversation(recipient));

      const pastMessages: ChatMessage[] = await conversation.messages();
      setMessages(pastMessages);

      sessionStorage.setItem(
        'chatMessages',
        JSON.stringify(pastMessages.map((m) => m.content))
      );

      for await (const msg of await conversation.streamMessages()) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id);
          const updated = exists ? prev : [...prev, msg];

          sessionStorage.setItem(
            'chatMessages',
            JSON.stringify(updated.map((m) => m.content))
          );

          return updated;
        });

        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    loadConversation();
  }, [xmtpClient, signer, address]);

  const handleSend = async () => {
    if (!message.trim() || !xmtpClient) return;

    const recipient =
      address?.toLowerCase() === SEND_ADDRESS.toLowerCase()
        ? REPLY_ADDRESS
        : SEND_ADDRESS;

    const existing = (await xmtpClient.conversations.list()).find(
      (c: any) => c.peerAddress?.toLowerCase() === recipient.toLowerCase()
    );

    const conversation =
      existing ?? (await xmtpClient.conversations.newConversation(recipient));

    await conversation.send(message);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderAddress: address!,
      content: message,
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    sessionStorage.setItem(
      'chatMessages',
      JSON.stringify(updated.map((m) => m.content))
    );

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
