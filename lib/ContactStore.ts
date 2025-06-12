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
  scopeCount: number;
  useAllMessages: boolean;
  aiLearnedInsights: string[];
  chatHistory: ChatEntry[];
  numSuggestions: number;
  aboutMe: string; // ✅
  aiObservationsAboutThem: string; // ✅
  aiObservationsAboutMe: string; // ✅
  aiSuggestBehavior: string; // ✅ NEW
  aiSuggestTone: ToneSettings; // ✅ NEW
};

const STORAGE_KEY = 'castcompass_contacts';

function getAllContacts(): Record<string, ContactData> {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveAllContacts(data: Record<string, ContactData>) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getContact(address: string): ContactData | null {
  const all = getAllContacts();
  return all[address] || null;
}

export function setContact(address: string, data: ContactData) {
  const all = getAllContacts();
  all[address] = data;
  saveAllContacts(all);
}

export function updateContact(address: string, updates: Partial<ContactData>) {
  const all = getAllContacts();
  const existing = all[address] || createEmptyContact(address);
  all[address] = { ...existing, ...updates };
  saveAllContacts(all);
}

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
    scopeCount: 5,
    useAllMessages: false,
    aiLearnedInsights: [],
    chatHistory: [],
    numSuggestions: 5,
    aboutMe: '', // ✅
    aiObservationsAboutThem: '', // ✅
    aiObservationsAboutMe: '', // ✅
    aiSuggestBehavior: '', // ✅ NEW
    aiSuggestTone: {
      warmth: 0.5,
      formality: 0.5,
      humor: 0.5,
      empathy: 0.5,
    }, // ✅ NEW
  };
}

export function appendMessageToHistory(address: string, newMessage: ChatEntry) {
  const all = getAllContacts();
  const contact = all[address] || createEmptyContact(address);
  const updatedHistory = [...(contact.chatHistory || []), newMessage].slice(-50);
  contact.chatHistory = updatedHistory;
  all[address] = contact;
  saveAllContacts(all);
}

export function deleteContact(address: string) {
  const all = getAllContacts();
  delete all[address];
  saveAllContacts(all);
}
