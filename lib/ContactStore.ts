// ContactStore.ts

export type ToneSettings = {
  warmth: number;
  formality: number;
  humor: number;
  empathy: number;
  [key: string]: number;
};

export type ChatEntry = {
  sender: 'user' | 'them';
  content: string;
  timestamp: number;
};

export type ContactData = {
  displayName: string;
  avatarUrl?: string;
  aboutThem: string;
  myIntentions: string;
  theySaidAboutMe: string;
  selfReflection: string;
  customInstruction: string;
  toneSettings: ToneSettings;
  aiLearnedInsights: string[];
  chatHistory: ChatEntry[];
};

const STORAGE_KEY = 'castcompass_contacts';

// ✅ Safe localStorage read
function getAllContacts(): Record<string, ContactData> {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return {};
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

// ✅ Safe localStorage write
function saveAllContacts(data: Record<string, ContactData>) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Get a single contact by wallet/address
export function getContact(address: string): ContactData | null {
  const all = getAllContacts();
  return all[address] || null;
}

// Create or overwrite a contact completely
export function setContact(address: string, data: ContactData) {
  const all = getAllContacts();
  all[address] = data;
  saveAllContacts(all);
}

// Update specific fields of a contact
export function updateContact(address: string, updates: Partial<ContactData>) {
  const all = getAllContacts();
  const existing = all[address] || createEmptyContact(address);
  all[address] = { ...existing, ...updates };
  saveAllContacts(all);
}

// Create empty default contact
export function createEmptyContact(address: string): ContactData {
  return {
    displayName: '',
    avatarUrl: '',
    aboutThem: '',
    myIntentions: '',
    theySaidAboutMe: '',
    selfReflection: '',
    customInstruction: '',
    toneSettings: {
      warmth: 0.5,
      formality: 0.5,
      humor: 0.5,
      empathy: 0.5,
    },
    aiLearnedInsights: [],
    chatHistory: [],
  };
}

// Append a new message to chatHistory, keeping only last 50
export function appendMessageToHistory(address: string, newMessage: ChatEntry) {
  const all = getAllContacts();
  const contact = all[address] || createEmptyContact(address);
  const updatedHistory = [...(contact.chatHistory || []), newMessage].slice(-50);
  contact.chatHistory = updatedHistory;
  all[address] = contact;
  saveAllContacts(all);
}

// Optional: remove a contact
export function deleteContact(address: string) {
  const all = getAllContacts();
  delete all[address];
  saveAllContacts(all);
}
