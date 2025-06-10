// useContactData.ts
import { useState, useEffect } from 'react'
import {
  ContactData,
  getContact,
  setContact,
  updateContact,
  createEmptyContact,
} from '../lib/ContactStore'

export function useContactData(address: string) {
  const [data, setData] = useState<ContactData>(() => getContact(address) || createEmptyContact(address))

  useEffect(() => {
    const stored = getContact(address)
    if (stored) setData(stored)
  }, [address])

  const save = (updates: Partial<ContactData>) => {
    const updated = { ...data, ...updates }
    setContact(address, updated)
    setData(updated)
  }

  return {
    contactData: data,
    setContactData: save,
  }
}
