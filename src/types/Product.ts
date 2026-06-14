export type ProductRating = {
  rate: number;
  count: number;
};

export interface Product {
  id: number;
  name: string;
  title: string;
  price: number;
  rating?: ProductRating;
  description?: string;
  image?: string;
  category?: string;
}
