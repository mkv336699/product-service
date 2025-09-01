export interface Cart {
    id: number;
    products: Product[];
    totalPrice: number;
    userId: number;
}

export interface Product {
    id: number;
    title: string;
    availableQuantity: number;
    maxOrderableQuantity: number;
    price: number;
    quantity?: number;
    reservedQuantity?: number;
}
