export interface ProductType {
    id: number;
    name: string;
    title: string;
    price: number;
    rating?: object;
    description?: string;
    image?: string;
    category?: string;
}

export interface OrderLineType extends ProductType {
    qty: number;
    discount: number;
}