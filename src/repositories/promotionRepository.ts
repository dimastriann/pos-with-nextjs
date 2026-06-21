import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { PromotionSchema } from '@/schemas/promotion.schema';
import { Promotion } from '@/models/PromoModels';
import { generateId } from '@/lib/utils/generateId';

export const promotionRepository = {
  getAll: (): Promise<Promotion[]> =>
    adapter.getAll<Promotion>(RESOURCE_KEYS.PROMOTIONS),

  getActive: async (): Promise<Promotion[]> => {
    const all = await adapter.getAll<Promotion>(RESOURCE_KEYS.PROMOTIONS);
    const now = new Date().toISOString();
    return all.filter((p) => {
      if (!p.active) return false;
      if (p.activeFrom && now < p.activeFrom) return false;
      if (p.activeTo && now > p.activeTo) return false;
      return true;
    });
  },

  create: async (data: Omit<Promotion, 'id'>): Promise<Promotion> => {
    const promo = PromotionSchema.parse({ ...data, id: generateId() });
    await adapter.create(RESOURCE_KEYS.PROMOTIONS, promo);
    return promo;
  },

  update: async (data: Promotion): Promise<Promotion> => {
    const promo = PromotionSchema.parse(data);
    await adapter.update(RESOURCE_KEYS.PROMOTIONS, promo);
    return promo;
  },

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.PROMOTIONS, id),
};
