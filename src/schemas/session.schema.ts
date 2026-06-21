import { z } from 'zod';

export const SessionSchema = z.object({
  id: z.string().min(1),
  shopId: z.string().min(1),
  userId: z.string().min(1),
  startAt: z.string(),
  endAt: z.string().optional(),
  status: z.enum(['Open', 'Closed']),
  totalOrders: z.number().int().min(0),
  totalCash: z.number().min(0),
  openingFloat: z.number().min(0).optional(),
  closingFloat: z.number().min(0).optional(),
});

export type SessionInput = z.infer<typeof SessionSchema>;
