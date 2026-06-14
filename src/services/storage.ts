import { User, UserRole } from '@/models/User';
import {
  Category,
  Uom,
  Contact,
  PaymentMethod,
  Warehouse,
} from '@/models/MasterData';

const STORAGE_KEYS = {
  USERS: 'pos_users',
  PRODUCTS: 'pos_products',
  CURRENT_USER: 'pos_current_user',
  CATEGORIES: 'pos_categories',
  UOM: 'pos_uom',
  CONTACTS: 'pos_contacts',
  PAYMENT_METHODS: 'pos_payment_methods',
  WAREHOUSES: 'pos_warehouses',
  POS_SHOPS: 'pos_data_shops',
  POS_SESSIONS: 'pos_data_sessions',
  POS_ORDERS: 'pos_data_orders',
  POS_ORDER_LINES: 'pos_data_order_lines',
  POS_PAYMENTS: 'pos_data_payments',
};

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    name: 'Administrator',
    role: UserRole.Admin,
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager',
    name: 'Shop Manager',
    role: UserRole.Manager,
    shopId: 'shop_1',
  },
  {
    id: '3',
    username: 'cashier',
    password: 'cashier',
    name: 'Cashier Staff',
    role: UserRole.Cashier,
    shopId: 'shop_1',
  },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Beverages', description: 'Drinks and liquids' },
  { id: '2', name: 'Snacks', description: 'Light food items' },
];

const DEFAULT_UOM: Uom[] = [
  { id: '1', name: 'Unit', symbol: 'pcs' },
  { id: '2', name: 'Kilogram', symbol: 'kg' },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: '1', name: 'Cash', type: 'Cash' },
  { id: '2', name: 'Bank Transfer', type: 'Bank' },
];

const DEFAULT_WAREHOUSES: Warehouse[] = [
  { id: '1', name: 'Main Warehouse', location: 'Jakarta' },
];

const DEFAULT_SHOPS = [
  { id: '1', name: 'Main Shop', address: 'Jakarta Center', active: true },
  { id: '2', name: 'Branch 01', address: 'South Jakarta', active: true },
];

class StorageService {
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined';
    if (this.isBrowser) {
      this.init();
    }
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.setItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.UOM)) {
      this.setItem(STORAGE_KEYS.UOM, DEFAULT_UOM);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
      this.setItem(STORAGE_KEYS.PAYMENT_METHODS, DEFAULT_PAYMENT_METHODS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WAREHOUSES)) {
      this.setItem(STORAGE_KEYS.WAREHOUSES, DEFAULT_WAREHOUSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.POS_SHOPS)) {
      this.setItem(STORAGE_KEYS.POS_SHOPS, DEFAULT_SHOPS);
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  // Generic CRUD helpers
  getAll<T>(key: string): T[] {
    return this.getItem<T[]>(key) || [];
  }

  add<T extends { id: string | number }>(key: string, item: T): void {
    const items = this.getAll<T>(key);
    items.push(item);
    this.setItem(key, items);
  }

  update<T extends { id: string | number }>(key: string, item: T): void {
    const items = this.getAll<T>(key);
    const index = items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      items[index] = item;
      this.setItem(key, items);
    }
  }

  remove<T extends { id: string | number }>(
    key: string,
    id: string | number,
  ): void {
    const items = this.getAll<T>(key);
    const newItems = items.filter((i) => i.id !== id);
    this.setItem(key, newItems);
  }
}

export const storageService = new StorageService();
export { STORAGE_KEYS };
