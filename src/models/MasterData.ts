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
