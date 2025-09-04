export interface ProductRef {
    id: number;
    quantity: number;
}

export interface Cart {
    id: number;
    products: ProductRef[];
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
