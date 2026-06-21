import { z } from 'zod';

export const PromotionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['product', 'category', 'order']),
  discountPct: z.number().min(0).max(100),
  productId: z.string().optional(),
  productName: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  minOrderAmount: z.number().min(0).optional(),
  activeFrom: z.string().optional(),
  activeTo: z.string().optional(),
  active: z.boolean(),
});
