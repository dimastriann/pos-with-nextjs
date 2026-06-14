import { Product } from './Product';
import { Customer } from './Customer';

export interface Order {
  id: number;
  lines: OrderLine[];
  customer: Customer;
  total_quantity: number;
  total_amount: number;
}

export interface OrderLine {
  id: number;
  product_name: string;
  product: Product;
  price: number;
  qty: number;
  discount: number;
}
