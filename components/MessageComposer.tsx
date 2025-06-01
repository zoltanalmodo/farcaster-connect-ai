import { useState } from 'react';
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

  const handleSend = async () => {
    try {
      if (!message) return;

      // 🛡️ Guard for missing wallet
    if (!window.ethereum) {
      alert("Please install MetaMask or another Ethereum wallet.");
      return;
    }

      setStatus('Connecting wallet...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const xmtp = await initXMTP(signer);

      setStatus('Creating conversation...');
      const conversation = await xmtp.conversations.newConversation(
        '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'// 👈 XMTP test address - Replace with real address LATER !
      );

      await conversation.send(message);
      setMessage('');
      setStatus('Message sent!');
    } catch (err) {
      console.error(err);
      setStatus('Error sending message');
    }
  };

  return (
    <div className="mb-6">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message..."
        className="w-full p-2 border rounded"
      />
      <button onClick={handleSend} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        Send
      </button>
      <div className="mt-2 text-sm text-gray-600">{status}</div>
    </div>
  );
}
