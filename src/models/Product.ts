export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId?: string;
  uomId?: string;
  description?: string;
  image?: string;
  barcode?: string;
}
