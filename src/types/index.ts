export interface Cart {
    id: number;
    products: Product[];
    totalPrice: number;
}

export interface Product {
    id: number;
    title: string;
    availableQuantity: number;
    maxOrderableQuantity: number;
    price: number;
}
