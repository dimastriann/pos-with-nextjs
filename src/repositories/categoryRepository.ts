import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { Category } from '@/models/MasterData';
import { generateId } from '@/lib/utils/generateId';

export const categoryRepository = {
  getAll: (): Promise<Category[]> =>
    adapter.getAll<Category>(RESOURCE_KEYS.CATEGORIES),

  getById: (id: string): Promise<Category | null> =>
    adapter.getById<Category>(RESOURCE_KEYS.CATEGORIES, id),

  create: (data: Omit<Category, 'id'>): Promise<Category> =>
    adapter.create(RESOURCE_KEYS.CATEGORIES, { ...data, id: generateId() }),

  update: (data: Category): Promise<Category> =>
    adapter.update(RESOURCE_KEYS.CATEGORIES, data),

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.CATEGORIES, id),
};
