import { IBackendAdapter, AuthResult } from '@/adapters/IBackendAdapter';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { User, UserRole } from '@/models/User';
import { Category, Uom, Contact, PaymentMethod, Warehouse } from '@/models/MasterData';
import { PosShop } from '@/models/PosModels';
import { Product } from '@/models/Product';

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', password: 'admin', name: 'Administrator', role: UserRole.Admin },
  { id: '2', username: 'manager', password: 'manager', name: 'Shop Manager', role: UserRole.Manager, shopId: 'shop_1' },
  { id: '3', username: 'cashier', password: 'cashier', name: 'Cashier Staff', role: UserRole.Cashier, shopId: 'shop_1' },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Beverages', description: 'Drinks and liquids' },
  { id: 'cat_2', name: 'Snacks', description: 'Light food items' },
  { id: 'cat_3', name: 'Electronics', description: 'Electronic goods' },
];

const DEFAULT_UOM: Uom[] = [
  { id: 'uom_1', name: 'Unit', symbol: 'pcs' },
  { id: 'uom_2', name: 'Kilogram', symbol: 'kg' },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_1', name: 'Cash', type: 'Cash' },
  { id: 'pm_2', name: 'Bank Transfer', type: 'Bank' },
  { id: 'pm_3', name: 'QRIS', type: 'E-Wallet' },
];

const DEFAULT_WAREHOUSES: Warehouse[] = [
  { id: 'wh_1', name: 'Main Warehouse', location: 'Jakarta' },
];

const DEFAULT_SHOPS: PosShop[] = [
  { id: 'shop_1', name: 'Main Shop', address: 'Jakarta Center', active: true },
  { id: 'shop_2', name: 'Branch 01', address: 'South Jakarta', active: true },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'prod_1', name: 'Mineral Water 600ml', price: 5000, stock: 100, categoryId: 'cat_1', image: '' },
  { id: 'prod_2', name: 'Orange Juice 250ml', price: 12000, stock: 50, categoryId: 'cat_1', image: '' },
  { id: 'prod_3', name: 'Green Tea 500ml', price: 8000, stock: 75, categoryId: 'cat_1', image: '' },
  { id: 'prod_4', name: 'Chocolate Biscuit', price: 15000, stock: 60, categoryId: 'cat_2', image: '' },
  { id: 'prod_5', name: 'Potato Chips Original', price: 18000, stock: 45, categoryId: 'cat_2', image: '' },
  { id: 'prod_6', name: 'Instant Noodles', price: 4500, stock: 200, categoryId: 'cat_2', image: '' },
  { id: 'prod_7', name: 'USB Cable Type-C', price: 35000, stock: 30, categoryId: 'cat_3', image: '' },
  { id: 'prod_8', name: 'Phone Charger 20W', price: 85000, stock: 20, categoryId: 'cat_3', image: '' },
  { id: 'prod_9', name: 'Earphone Wired', price: 45000, stock: 25, categoryId: 'cat_3', image: '' },
  { id: 'prod_10', name: 'Coffee Sachet', price: 3500, stock: 150, categoryId: 'cat_1', image: '' },
];

const DEFAULT_CONTACTS: Contact[] = [
  { id: 'con_1', name: 'Walk-in Customer', type: 'Customer' },
  { id: 'con_2', name: 'PT Supplier Utama', type: 'Supplier', phone: '021-555-0001' },
];

export class LocalStorageAdapter implements IBackendAdapter {
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    if (this.isBrowser) this.seed();
  }

  private seed() {
    const seed = <T>(key: string, data: T[]) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    };
    seed(RESOURCE_KEYS.USERS, DEFAULT_USERS);
    seed(RESOURCE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    seed(RESOURCE_KEYS.UOM, DEFAULT_UOM);
    seed(RESOURCE_KEYS.PAYMENT_METHODS, DEFAULT_PAYMENT_METHODS);
    seed(RESOURCE_KEYS.WAREHOUSES, DEFAULT_WAREHOUSES);
    seed(RESOURCE_KEYS.SHOPS, DEFAULT_SHOPS);
    seed(RESOURCE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    seed(RESOURCE_KEYS.CONTACTS, DEFAULT_CONTACTS);
  }

  private read<T>(key: string): T[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  }

  private write<T>(key: string, data: T[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getAll<T>(resource: string): Promise<T[]> {
    return this.read<T>(resource);
  }

  async getById<T>(resource: string, id: string): Promise<T | null> {
    const items = this.read<T & { id: string }>(resource);
    return items.find((i) => i.id === id) ?? null;
  }

  async create<T extends { id: string }>(resource: string, item: T): Promise<T> {
    const items = this.read<T>(resource);
    items.push(item);
    this.write(resource, items);
    return item;
  }

  async update<T extends { id: string }>(resource: string, item: T): Promise<T> {
    const items = this.read<T>(resource);
    const idx = items.findIndex((i) => (i as T & { id: string }).id === item.id);
    if (idx !== -1) items[idx] = item;
    this.write(resource, items);
    return item;
  }

  async delete(resource: string, id: string): Promise<void> {
    const items = this.read<{ id: string }>(resource);
    this.write(resource, items.filter((i) => i.id !== id));
  }

  async login(username: string, password: string): Promise<AuthResult> {
    const users = this.read<User>(RESOURCE_KEYS.USERS);
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) return { success: false, error: 'Invalid username or password' };
    const { password: _pw, ...safe } = user;
    if (this.isBrowser) {
      localStorage.setItem(RESOURCE_KEYS.CURRENT_USER, JSON.stringify(safe));
    }
    return { success: true, user: safe as User };
  }

  async logout(): Promise<void> {
    if (this.isBrowser) localStorage.removeItem(RESOURCE_KEYS.CURRENT_USER);
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(RESOURCE_KEYS.CURRENT_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
