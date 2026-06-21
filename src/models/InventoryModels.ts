export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  qty: number; // positive = stock in, negative = stock out
  type: 'in' | 'out' | 'correction';
  reason: string;
  date: string; // ISO
  notes?: string;
}

export interface PurchaseOrderLine {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  qty: number;
  costPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string; // ISO
  expectedDate?: string; // ISO
  status: 'Draft' | 'Confirmed' | 'Received';
  notes?: string;
  lines?: PurchaseOrderLine[];
}
