import { IBackendAdapter, AuthResult } from '@/adapters/IBackendAdapter';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { User, UserRole } from '@/models/User';
import {
  Category,
  Uom,
  Contact,
  PaymentMethod,
  Warehouse,
} from '@/models/MasterData';
import { PosShop } from '@/models/PosModels';
import { Product } from '@/models/Product';

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
  {
    id: 'shop_1',
    name: 'Main Shop',
    address: 'Jl. Sudirman No. 1, Jakarta Pusat',
    phone: '021-555-0100',
    email: 'main@posflow.id',
    taxRate: 11,
    receiptFooter: 'Thank you for shopping with us! Have a great day.',
    active: true,
  },
  {
    id: 'shop_2',
    name: 'Branch 01',
    address: 'Jl. Fatmawati No. 25, Jakarta Selatan',
    phone: '021-555-0200',
    email: 'branch01@posflow.id',
    taxRate: 11,
    receiptFooter: 'Thank you for your purchase!',
    active: true,
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Mineral Water 600ml',
    sku: 'BEV-MW-600',
    price: 5000,
    costPrice: 2500,
    stock: 100,
    minStock: 20,
    categoryId: 'cat_1',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560001',
    active: true,
  },
  {
    id: 'prod_2',
    name: 'Orange Juice 250ml',
    sku: 'BEV-OJ-250',
    price: 12000,
    costPrice: 7000,
    stock: 50,
    minStock: 10,
    categoryId: 'cat_1',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560002',
    active: true,
  },
  {
    id: 'prod_3',
    name: 'Green Tea 500ml',
    sku: 'BEV-GT-500',
    price: 8000,
    costPrice: 4500,
    stock: 75,
    minStock: 15,
    categoryId: 'cat_1',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560003',
    active: true,
  },
  {
    id: 'prod_4',
    name: 'Chocolate Biscuit',
    sku: 'SNK-CB-001',
    price: 15000,
    costPrice: 9000,
    stock: 60,
    minStock: 10,
    categoryId: 'cat_2',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560004',
    active: true,
  },
  {
    id: 'prod_5',
    name: 'Potato Chips Original',
    sku: 'SNK-PC-ORG',
    price: 18000,
    costPrice: 11000,
    stock: 45,
    minStock: 10,
    categoryId: 'cat_2',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560005',
    active: true,
  },
  {
    id: 'prod_6',
    name: 'Instant Noodles',
    sku: 'SNK-IN-001',
    price: 4500,
    costPrice: 2800,
    stock: 200,
    minStock: 50,
    categoryId: 'cat_2',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560006',
    active: true,
  },
  {
    id: 'prod_7',
    name: 'USB Cable Type-C',
    sku: 'ELC-USB-TC',
    price: 35000,
    costPrice: 18000,
    stock: 30,
    minStock: 5,
    categoryId: 'cat_3',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560007',
    active: true,
  },
  {
    id: 'prod_8',
    name: 'Phone Charger 20W',
    sku: 'ELC-CHG-20W',
    price: 85000,
    costPrice: 50000,
    stock: 20,
    minStock: 5,
    categoryId: 'cat_3',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560008',
    active: true,
  },
  {
    id: 'prod_9',
    name: 'Earphone Wired',
    sku: 'ELC-EP-WRD',
    price: 45000,
    costPrice: 25000,
    stock: 25,
    minStock: 5,
    categoryId: 'cat_3',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560009',
    active: true,
  },
  {
    id: 'prod_10',
    name: 'Coffee Sachet',
    sku: 'BEV-CF-SCH',
    price: 3500,
    costPrice: 1800,
    stock: 150,
    minStock: 30,
    categoryId: 'cat_1',
    uomId: 'uom_1',
    image: '',
    barcode: '8991234560010',
    active: true,
  },
];

const DEFAULT_CONTACTS: Contact[] = [
  { id: 'con_1', name: 'Walk-in Customer', type: 'Customer' },
  {
    id: 'con_2',
    name: 'PT Supplier Utama',
    type: 'Supplier',
    phone: '021-555-0001',
    email: 'info@supplierutama.co.id',
    address: 'Jl. Industri No. 5, Bekasi',
    taxId: '01.234.567.8-901.000',
  },
  {
    id: 'con_3',
    name: 'Budi Santoso',
    type: 'Customer',
    phone: '0812-3456-7890',
    email: 'budi@example.com',
    address: 'Jl. Merdeka No. 10, Jakarta',
    loyaltyPoints: 25,
  },
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
    seed(RESOURCE_KEYS.STOCK_ADJUSTMENTS, []);
    seed(RESOURCE_KEYS.PURCHASE_ORDERS, []);
    seed(RESOURCE_KEYS.PURCHASE_ORDER_LINES, []);
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

  async create<T extends { id: string }>(
    resource: string,
    item: T,
  ): Promise<T> {
    const items = this.read<T>(resource);
    items.push(item);
    this.write(resource, items);
    return item;
  }

  async update<T extends { id: string }>(
    resource: string,
    item: T,
  ): Promise<T> {
    const items = this.read<T>(resource);
    const idx = items.findIndex(
      (i) => (i as T & { id: string }).id === item.id,
    );
    if (idx !== -1) items[idx] = item;
    this.write(resource, items);
    return item;
  }

  async delete(resource: string, id: string): Promise<void> {
    const items = this.read<{ id: string }>(resource);
    this.write(
      resource,
      items.filter((i) => i.id !== id),
    );
  }

  async login(username: string, password: string): Promise<AuthResult> {
    const users = this.read<User>(RESOURCE_KEYS.USERS);
    const user = users.find(
      (u) => u.username === username && u.password === password,
    );
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
