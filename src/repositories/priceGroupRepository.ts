import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { PriceGroupSchema, PriceGroupItemSchema } from '@/schemas/priceGroup.schema';
import { PriceGroup, PriceGroupItem } from '@/models/PromoModels';
import { generateId } from '@/lib/utils/generateId';

export const priceGroupRepository = {
  getAll: (): Promise<PriceGroup[]> =>
    adapter.getAll<PriceGroup>(RESOURCE_KEYS.PRICE_GROUPS),

  getById: (id: string): Promise<PriceGroup | null> =>
    adapter.getById<PriceGroup>(RESOURCE_KEYS.PRICE_GROUPS, id),

  create: async (data: Omit<PriceGroup, 'id'>): Promise<PriceGroup> => {
    const group = PriceGroupSchema.parse({ ...data, id: generateId() });
    await adapter.create(RESOURCE_KEYS.PRICE_GROUPS, group);
    return group;
  },

  update: async (data: PriceGroup): Promise<PriceGroup> => {
    const group = PriceGroupSchema.parse(data);
    await adapter.update(RESOURCE_KEYS.PRICE_GROUPS, group);
    return group;
  },

  delete: async (id: string): Promise<void> => {
    await adapter.delete(RESOURCE_KEYS.PRICE_GROUPS, id);
    // Remove all items for this group
    const items = await adapter.getAll<PriceGroupItem>(RESOURCE_KEYS.PRICE_GROUP_ITEMS);
    for (const item of items.filter((i) => i.priceGroupId === id)) {
      await adapter.delete(RESOURCE_KEYS.PRICE_GROUP_ITEMS, item.id);
    }
  },

  getItemsByGroupId: async (priceGroupId: string): Promise<PriceGroupItem[]> => {
    const all = await adapter.getAll<PriceGroupItem>(RESOURCE_KEYS.PRICE_GROUP_ITEMS);
    return all.filter((i) => i.priceGroupId === priceGroupId);
  },

  upsertItem: async (
    data: Omit<PriceGroupItem, 'id'> & { id?: string },
  ): Promise<PriceGroupItem> => {
    if (data.id) {
      const item = PriceGroupItemSchema.parse(data);
      await adapter.update(RESOURCE_KEYS.PRICE_GROUP_ITEMS, item);
      return item;
    }
    const item = PriceGroupItemSchema.parse({ ...data, id: generateId() });
    await adapter.create(RESOURCE_KEYS.PRICE_GROUP_ITEMS, item);
    return item;
  },

  deleteItem: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.PRICE_GROUP_ITEMS, id),
};
