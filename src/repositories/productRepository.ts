import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { ProductSchema } from '@/schemas/product.schema';
import { Product } from '@/models/Product';
import { generateId } from '@/lib/utils/generateId';

export const productRepository = {
  getAll: (): Promise<Product[]> =>
    adapter.getAll<Product>(RESOURCE_KEYS.PRODUCTS),

  getById: (id: string): Promise<Product | null> =>
    adapter.getById<Product>(RESOURCE_KEYS.PRODUCTS, id),

  create: (data: Omit<Product, 'id'>): Promise<Product> => {
    const product = ProductSchema.parse({ ...data, id: generateId() });
    return adapter.create(RESOURCE_KEYS.PRODUCTS, product);
  },

  update: (data: Product): Promise<Product> => {
    const product = ProductSchema.parse(data);
    return adapter.update(RESOURCE_KEYS.PRODUCTS, product);
  },

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.PRODUCTS, id),

  decrementStock: async (id: string, qty: number): Promise<void> => {
    const product = await adapter.getById<Product>(RESOURCE_KEYS.PRODUCTS, id);
    if (!product) return;
    const updated = { ...product, stock: Math.max(0, product.stock - qty) };
    await adapter.update(RESOURCE_KEYS.PRODUCTS, updated);
  },
};
