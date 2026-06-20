export interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  categoryId?: string;
  uomId?: string;
  description?: string;
  image?: string;
  barcode?: string;
  active?: boolean;
}
