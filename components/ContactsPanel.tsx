import React, { useState } from 'react';
import { resolveIdentity } from '../lib/agentkit';

type Contact = {
  address: string;
  displayName: string;
  avatar?: string;
  bio?: string;
};

type Props = {
  onSelectContact: (address: string) => void;
};

const ContactsPanel: React.FC<Props> = ({ onSelectContact }) => {
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddContact = async () => {
    if (!input.trim()) return;

    try {
      setError(null);
      const identity = await resolveIdentity(input.trim());

      if (!identity?.walletAddress) {
        setError('Could not resolve address');
        return;
      }

      const contact: Contact = {
        address: identity.walletAddress,
        displayName: identity.displayName || input.trim(),
        avatar: identity.avatarUrl || 'https://placekitten.com/40/40',
        bio: identity.profileBio || '',
      };

      setContacts((prev) => [...prev, contact]);
      setInput('');
    } catch (err) {
      console.error('Failed to resolve identity:', err);
      setError('Failed to resolve identity');
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
            <img
              src={contact.avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold">{contact.displayName}</div>
              <div className="text-sm text-gray-600">{contact.bio}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsPanel;
