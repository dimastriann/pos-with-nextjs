import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { PosShop } from '@/models/PosModels';
import { generateId } from '@/lib/utils/generateId';

export const shopRepository = {
  getAll: (): Promise<PosShop[]> =>
    adapter.getAll<PosShop>(RESOURCE_KEYS.SHOPS),

  getById: (id: string): Promise<PosShop | null> =>
    adapter.getById<PosShop>(RESOURCE_KEYS.SHOPS, id),

  create: (data: Omit<PosShop, 'id'>): Promise<PosShop> =>
    adapter.create(RESOURCE_KEYS.SHOPS, { ...data, id: generateId() }),

  update: (data: PosShop): Promise<PosShop> =>
    adapter.update(RESOURCE_KEYS.SHOPS, data),

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.SHOPS, id),
};
