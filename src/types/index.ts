export interface Cart {
    id: number;
    products: any[];
    totalPrice: number;
}

export interface Product {
    id: number;
    title: string;
    availableQuantity: number;
    maxOrderableQuantity: number;
    price: number;
}
