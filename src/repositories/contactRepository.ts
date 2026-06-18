import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { Contact } from '@/models/MasterData';
import { generateId } from '@/lib/utils/generateId';

export const contactRepository = {
  getAll: (): Promise<Contact[]> =>
    adapter.getAll<Contact>(RESOURCE_KEYS.CONTACTS),

  getById: (id: string): Promise<Contact | null> =>
    adapter.getById<Contact>(RESOURCE_KEYS.CONTACTS, id),

  create: (data: Omit<Contact, 'id'>): Promise<Contact> =>
    adapter.create(RESOURCE_KEYS.CONTACTS, { ...data, id: generateId() }),

  update: (data: Contact): Promise<Contact> =>
    adapter.update(RESOURCE_KEYS.CONTACTS, data),

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.CONTACTS, id),

  earnPoints: async (id: string, amount: number): Promise<void> => {
    const contact = await adapter.getById<Contact>(RESOURCE_KEYS.CONTACTS, id);
    if (!contact) return;
    const earned = Math.floor(amount / 10000);
    if (earned <= 0) return;
    await adapter.update(RESOURCE_KEYS.CONTACTS, {
      ...contact,
      loyaltyPoints: (contact.loyaltyPoints ?? 0) + earned,
    });
  },

  redeemPoints: async (id: string, points: number): Promise<void> => {
    const contact = await adapter.getById<Contact>(RESOURCE_KEYS.CONTACTS, id);
    if (!contact) return;
    const current = contact.loyaltyPoints ?? 0;
    await adapter.update(RESOURCE_KEYS.CONTACTS, {
      ...contact,
      loyaltyPoints: Math.max(0, current - points),
    });
  },
};
