import { FirebaseService } from '../../shared/firebase/firebase.service';
import { ProductsService } from '../products/products.service';
export declare class CartService {
    private readonly firebaseService;
    private readonly productsService;
    constructor(firebaseService: FirebaseService, productsService: ProductsService);
    getCart(customerId: string): Promise<any[]>;
    addItem(body: any): Promise<any>;
    updateQty(id: string, qty: number): Promise<{
        success: boolean;
        message: string;
        id?: undefined;
    } | {
        success: boolean;
        id: string;
        message?: undefined;
    } | {
        id: string;
        success?: undefined;
        message?: undefined;
    }>;
    removeItem(id: string): Promise<{
        success: boolean;
        message: string;
        id?: undefined;
    } | {
        success: boolean;
        id: string;
        message?: undefined;
    }>;
    clearCart(customerId: string): Promise<{
        success: boolean;
    }>;
}
