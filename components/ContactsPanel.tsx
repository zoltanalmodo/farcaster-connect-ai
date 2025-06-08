// components/ContactsPanel.tsx
import React, { useEffect, useState } from 'react';
import { resolveIdentity } from '../lib/agentkit';
import { Client } from '@xmtp/xmtp-js';
import { useWalletClient } from 'wagmi';
import { walletClientToSigner } from '../lib/walletClientToSigner';

type Contact = {
  address: string;
  displayName: string;
};

type Props = {
  onSelectContact: (address: string) => void;
};

const ContactsPanel: React.FC<Props> = ({ onSelectContact }) => {
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const saved = localStorage.getItem('contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved contacts:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleAddContact = async () => {
    if (!input.trim()) return;
    if (!walletClient) {
      setError('Please connect your wallet first.');
      return;
    }

    try {
      setError(null);
      const signer = await walletClientToSigner(walletClient);

      const identity = await resolveIdentity(input.trim());
      console.log('✅ resolveIdentity output:', identity);
      if (!identity?.walletAddress) {
        setError('Could not resolve address');
        return;
      }

      const xmtp = await Client.create(signer);
      const canMessage = await xmtp.canMessage(identity.walletAddress);

      if (!canMessage) {
        setError('This user is not on XMTP.');
        return;
      }

      const contact: Contact = {
        address: identity.walletAddress,
        displayName: identity.displayName,
      };

      setContacts((prev) => [...prev, contact]);
      setInput('');
    } catch (err) {
      console.error('Failed to resolve identity or XMTP check:', err);
      setError('Could not add contact.');
    }
  };

  return (
    <div className="contacts-panel">
      <h2 className="text-lg font-bold mb-3">🧑‍🤝‍🧑 Contacts</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border px-3 py-2 rounded"
          placeholder="@handle, .eth, or 0x..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleAddContact}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            onClick={() => onSelectContact(contact.address)}
            className="flex items-center gap-3 p-2 border rounded hover:bg-gray-100 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
              {contact.displayName[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{contact.displayName}</div>
              <div className="text-sm text-gray-600">{contact.address}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsPanel;
