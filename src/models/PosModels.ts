export interface PosShop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
}

export interface PosSession {
  id: string;
  shopId: string;
  userId: string;
  startAt: string; // ISO Date
  endAt?: string; // ISO Date
  status: 'Open' | 'Closed';
  totalOrders: number;
  totalCash: number;
}

export interface PosOrderLine {
  id: string;
  orderId: string;
  productId: string;
  productName: string; // denormalized for easier display
  qty: number;
  price: number;
  subtotal: number;
}

export interface PosPayment {
  id: string;
  orderId: string;
  methodId: string;
  methodName: string; // denormalized
  amount: number;
  date: string;
}

export interface PosOrder {
  id: string;
  sessionId: string;
  shopId: string;
  customerId?: string;
  customerName?: string;
  date: string;
  totalAmount: number;
  status: 'Draft' | 'Paid' | 'Cancelled';
  lines?: PosOrderLine[]; // Optional for list view, required for form
  payments?: PosPayment[]; // Optional for list view
}
