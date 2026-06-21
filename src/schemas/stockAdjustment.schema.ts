import { z } from 'zod';

export const StockAdjustmentSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  qty: z.number().int().refine((v) => v !== 0, 'Quantity cannot be zero'),
  type: z.enum(['in', 'out', 'correction']),
  reason: z.string().min(1),
  date: z.string(),
  notes: z.string().optional(),
});
