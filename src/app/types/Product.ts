export interface Product {
    id: number;
    name: string;
    title: string;
    price: number;
    rating?: object;
    description?: string;
    image?: string;
    category?: string;
}

export interface OrderLine extends Product {
    qty: number;
    discount: number;
}