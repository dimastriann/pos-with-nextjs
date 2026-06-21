import { z } from 'zod';

export const PriceGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const PriceGroupItemSchema = z.object({
  id: z.string().min(1),
  priceGroupId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  customPrice: z.number().min(0),
});
