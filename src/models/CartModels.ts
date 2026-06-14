export interface CartLine {
  productId: string;
  productName: string;
  price: number;
  qty: number;
  discount: number; // percentage (0-100)
  subtotal: number; // price * qty * (1 - discount / 100)
}

export interface ActivePayment {
  methodId: string;
  methodName: string;
  amount: number;
}
