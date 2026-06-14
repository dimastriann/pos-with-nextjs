import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { Uom } from '@/models/MasterData';
import { generateId } from '@/lib/utils/generateId';

export const uomRepository = {
  getAll: (): Promise<Uom[]> =>
    adapter.getAll<Uom>(RESOURCE_KEYS.UOM),

  getById: (id: string): Promise<Uom | null> =>
    adapter.getById<Uom>(RESOURCE_KEYS.UOM, id),

  create: (data: Omit<Uom, 'id'>): Promise<Uom> =>
    adapter.create(RESOURCE_KEYS.UOM, { ...data, id: generateId() }),

  update: (data: Uom): Promise<Uom> =>
    adapter.update(RESOURCE_KEYS.UOM, data),

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.UOM, id),
};
