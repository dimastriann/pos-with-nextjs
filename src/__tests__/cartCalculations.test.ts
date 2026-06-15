import {
  computeSubtotal,
  computeCartTotal,
  computeChange,
} from '@/lib/utils/cartCalculations';
import { CartLine } from '@/models/CartModels';

const makeCartLine = (overrides: Partial<CartLine> = {}): CartLine => ({
  productId: 'p1',
  productName: 'Product 1',
  price: 10000,
  qty: 1,
  discount: 0,
  subtotal: 10000,
  ...overrides,
});

describe('computeSubtotal', () => {
  it('returns price × qty when discount is 0', () => {
    expect(computeSubtotal(10000, 3, 0)).toBe(30000);
  });

  it('applies percentage discount correctly', () => {
    expect(computeSubtotal(10000, 2, 10)).toBeCloseTo(18000);
  });

  it('returns 0 when discount is 100%', () => {
    expect(computeSubtotal(10000, 1, 100)).toBe(0);
  });

  it('returns 0 when qty is 0', () => {
    expect(computeSubtotal(10000, 0, 0)).toBe(0);
  });

  it('handles fractional discount (25%)', () => {
    expect(computeSubtotal(20000, 1, 25)).toBeCloseTo(15000);
  });
});

describe('computeCartTotal', () => {
  it('returns 0 for an empty cart', () => {
    expect(computeCartTotal([])).toBe(0);
  });

  it('returns the subtotal of a single line', () => {
    const lines = [makeCartLine({ subtotal: 12000 })];
    expect(computeCartTotal(lines)).toBe(12000);
  });

  it('sums subtotals across multiple lines', () => {
    const lines = [
      makeCartLine({ productId: 'a', subtotal: 10000 }),
      makeCartLine({ productId: 'b', subtotal: 8000 }),
      makeCartLine({ productId: 'c', subtotal: 5000 }),
    ];
    expect(computeCartTotal(lines)).toBe(23000);
  });
});

describe('computeChange', () => {
  it('returns 0 when paid amount equals total', () => {
    expect(computeChange(10000, 10000)).toBe(0);
  });

  it('returns positive change when overpaid', () => {
    expect(computeChange(10000, 15000)).toBe(5000);
  });

  it('returns 0 (not negative) when underpaid', () => {
    expect(computeChange(10000, 5000)).toBe(0);
  });

  it('returns 0 when amount paid is 0', () => {
    expect(computeChange(10000, 0)).toBe(0);
  });
});
