import { z } from 'zod';

export const OrderLineSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string(),
  qty: z.number().int().positive(),
  price: z.number().positive(),
  discount: z.number().min(0).max(100),
  subtotal: z.number().min(0),
});

export const PaymentRecordSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  methodId: z.string().min(1),
  methodName: z.string(),
  amount: z.number().positive(),
  date: z.string(),
});

export const OrderSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string(),
  shopId: z.string(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  date: z.string(),
  totalAmount: z.number().min(0),
  status: z.enum(['Draft', 'Paid', 'Cancelled', 'Refunded']),
});
