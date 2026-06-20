import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  costPrice: z.number().nonnegative().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  minStock: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),
  uomId: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  barcode: z.string().optional(),
  active: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;
