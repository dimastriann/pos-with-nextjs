export interface Promotion {
  id: string;
  name: string;
  type: 'product' | 'category' | 'order';
  discountPct: number; // 0-100
  productId?: string;
  productName?: string;
  categoryId?: string;
  categoryName?: string;
  minOrderAmount?: number; // only for type='order'
  activeFrom?: string; // ISO date string
  activeTo?: string;   // ISO date string
  active: boolean;
}

export interface PriceGroup {
  id: string;
  name: string;
  description?: string;
}

export interface PriceGroupItem {
  id: string;
  priceGroupId: string;
  productId: string;
  productName: string;
  customPrice: number;
}
