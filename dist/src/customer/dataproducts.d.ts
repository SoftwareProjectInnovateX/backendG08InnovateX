export interface Category {
    id: string;
    name: string;
    icon: string;
}
export interface ProductDetails {
    ingredients?: string;
    usage?: string;
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
export declare const CATEGORIES: Category[];
export declare const ALL_PRODUCTS: Product[];
export declare const getProductById: (id: string) => Product | undefined;
export declare const getProductsByCategory: (categoryId: string) => Product[];
