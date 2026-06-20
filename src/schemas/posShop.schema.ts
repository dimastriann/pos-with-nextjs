import { z } from 'zod';

export const PosShopSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Shop name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  logoUrl: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  receiptFooter: z.string().optional(),
  active: z.boolean(),
});

export type PosShopInput = z.infer<typeof PosShopSchema>;
