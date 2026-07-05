export interface ProductDetails {
    ingredients?: string;
    usage?: string;
    warnings?: string;
    benefits?: string[];
    specifications?: Record<string, string>;
}
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
    requiresPrescription: boolean;
    brand: string;
    rating: number;
    reviews: number;
    details?: ProductDetails;
}
export interface Category {
    id: string;
    name: string;
    icon: string;
}
export interface CartItem {
    product: Product;
    quantity: number;
}
