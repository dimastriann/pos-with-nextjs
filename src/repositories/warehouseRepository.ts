import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { Warehouse } from '@/models/MasterData';
import { generateId } from '@/lib/utils/generateId';

export const warehouseRepository = {
  getAll: (): Promise<Warehouse[]> =>
    adapter.getAll<Warehouse>(RESOURCE_KEYS.WAREHOUSES),

  getById: (id: string): Promise<Warehouse | null> =>
    adapter.getById<Warehouse>(RESOURCE_KEYS.WAREHOUSES, id),

  create: (data: Omit<Warehouse, 'id'>): Promise<Warehouse> =>
    adapter.create(RESOURCE_KEYS.WAREHOUSES, { ...data, id: generateId() }),

  update: (data: Warehouse): Promise<Warehouse> =>
    adapter.update(RESOURCE_KEYS.WAREHOUSES, data),

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.WAREHOUSES, id),
};
