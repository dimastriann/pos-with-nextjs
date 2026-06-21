import { z } from 'zod';

export const PurchaseOrderLineSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  qty: z.number().int().positive(),
  costPrice: z.number().min(0),
  subtotal: z.number().min(0),
});

export const PurchaseOrderSchema = z.object({
  id: z.string().min(1),
  supplierId: z.string().min(1),
  supplierName: z.string().min(1),
  date: z.string(),
  expectedDate: z.string().optional(),
  status: z.enum(['Draft', 'Confirmed', 'Received']),
  notes: z.string().optional(),
});
