// jest.mock must use only inline values — SWC does not hoist const declarations
jest.mock('@/adapters', () => ({
  adapter: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

import { productRepository } from '@/repositories/productRepository';
import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';

const PRODUCTS = RESOURCE_KEYS.PRODUCTS;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('productRepository.getAll', () => {
  it('delegates to adapter.getAll and returns products', async () => {
    const products = [{ id: 'p1', name: 'Coffee', price: 15000, stock: 10 }];
    (adapter.getAll as jest.Mock).mockResolvedValue(products);

    const result = await productRepository.getAll();

    expect(result).toEqual(products);
    expect(adapter.getAll).toHaveBeenCalledWith(PRODUCTS);
  });

  it('returns an empty array when adapter returns nothing', async () => {
    (adapter.getAll as jest.Mock).mockResolvedValue([]);
    const result = await productRepository.getAll();
    expect(result).toEqual([]);
  });
});

describe('productRepository.getById', () => {
  it('returns null when product is not found', async () => {
    (adapter.getById as jest.Mock).mockResolvedValue(null);
    const result = await productRepository.getById('unknown');
    expect(result).toBeNull();
    expect(adapter.getById).toHaveBeenCalledWith(PRODUCTS, 'unknown');
  });

  it('returns the product when found', async () => {
    const product = { id: 'p1', name: 'Coffee', price: 15000, stock: 10 };
    (adapter.getById as jest.Mock).mockResolvedValue(product);
    const result = await productRepository.getById('p1');
    expect(result?.id).toBe('p1');
  });
});

describe('productRepository.create', () => {
  it('generates an id and calls adapter.create', async () => {
    const data = { name: 'Espresso', price: 20000, stock: 100 };
    (adapter.create as jest.Mock).mockImplementation((_res: string, item: unknown) =>
      Promise.resolve(item)
    );

    const created = await productRepository.create(data);

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Espresso');
    expect(adapter.create).toHaveBeenCalledWith(
      PRODUCTS,
      expect.objectContaining({ name: 'Espresso', price: 20000 })
    );
  });

  it('throws a Zod error when price is negative', () => {
    // ProductSchema.parse() throws synchronously before a Promise is returned
    expect(() => productRepository.create({ name: 'Bad', price: -1, stock: 0 })).toThrow();
    expect(adapter.create).not.toHaveBeenCalled();
  });

  it('throws a Zod error when name is empty', () => {
    expect(() => productRepository.create({ name: '', price: 1000, stock: 0 })).toThrow();
  });
});

describe('productRepository.update', () => {
  it('validates and calls adapter.update', async () => {
    const product = { id: 'p1', name: 'Coffee', price: 15000, stock: 10 };
    (adapter.update as jest.Mock).mockResolvedValue({ ...product, price: 18000 });

    const updated = await productRepository.update({ ...product, price: 18000 });

    expect(updated.price).toBe(18000);
    expect(adapter.update).toHaveBeenCalledWith(
      PRODUCTS,
      expect.objectContaining({ price: 18000 })
    );
  });
});

describe('productRepository.delete', () => {
  it('calls adapter.delete with the correct resource and id', async () => {
    (adapter.delete as jest.Mock).mockResolvedValue(undefined);
    await productRepository.delete('p1');
    expect(adapter.delete).toHaveBeenCalledWith(PRODUCTS, 'p1');
  });
});

describe('productRepository.decrementStock', () => {
  it('decrements stock by the given quantity', async () => {
    const product = { id: 'p1', name: 'Coffee', price: 15000, stock: 10 };
    (adapter.getById as jest.Mock).mockResolvedValue(product);
    (adapter.update as jest.Mock).mockImplementation((_res: string, item: unknown) =>
      Promise.resolve(item)
    );

    await productRepository.decrementStock('p1', 3);

    expect(adapter.update).toHaveBeenCalledWith(
      PRODUCTS,
      expect.objectContaining({ id: 'p1', stock: 7 })
    );
  });

  it('clamps stock at 0 and does not go negative', async () => {
    const product = { id: 'p1', name: 'Coffee', price: 15000, stock: 2 };
    (adapter.getById as jest.Mock).mockResolvedValue(product);
    (adapter.update as jest.Mock).mockImplementation((_res: string, item: unknown) =>
      Promise.resolve(item)
    );

    await productRepository.decrementStock('p1', 10);

    expect(adapter.update).toHaveBeenCalledWith(
      PRODUCTS,
      expect.objectContaining({ stock: 0 })
    );
  });

  it('does nothing when product does not exist', async () => {
    (adapter.getById as jest.Mock).mockResolvedValue(null);
    await productRepository.decrementStock('nonexistent', 1);
    expect(adapter.update).not.toHaveBeenCalled();
  });
});
