export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Uom {
  id: string;
  name: string;
  symbol: string;
}

export interface Contact {
  id: string;
  name: string;
  type: 'Customer' | 'Supplier';
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  loyaltyPoints?: number; // 1 point earned per 10,000 IDR spent; 1 point = 1,000 IDR redemption
  priceGroupId?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'E-Wallet';
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}
