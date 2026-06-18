import { CartLine } from '@/models/CartModels';

export function computeSubtotal(
  price: number,
  qty: number,
  discount: number,
): number {
  return price * qty * (1 - discount / 100);
}

export function computeCartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.subtotal, 0);
}

export function computeOrderTotal(
  lines: CartLine[],
  orderDiscount: number,
): number {
  const subtotal = computeCartTotal(lines);
  return subtotal * (1 - Math.min(100, Math.max(0, orderDiscount)) / 100);
}

export function computeChange(total: number, amountPaid: number): number {
  return Math.max(0, amountPaid - total);
}
