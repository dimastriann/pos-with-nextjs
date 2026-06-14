import { Customer } from './Customer';
import { Order, OrderLine } from './Order';
import { Product } from './Product';

export type POSContextState = {
  currentOrder: Order;
  currentOrderLine: OrderLine;
  customer: Customer | null;
  addProduct: (product: Product) => void;
  updateQty: (id: number, qty: number) => void;
  removeLine: (id: number) => void;
  setCustomer: (customer: Customer | null) => void;
  clearOrder: () => void;
  getTotal: () => number;
  OrderList: Order[];
};

export const defaultPOSContext = {
  currentOrder: {},
  currentOrderLine: [],
  customer: {},
  addProduct: (product: Product) => undefined,
  updateQty: (id: number, qty: number) => undefined,
  removeLine: (id: number) => undefined,
  setCustomer: (customer: Customer | null) => undefined,
  clearOrder: () => undefined,
  getTotal: () => 0,
  OrderList: [],
};
