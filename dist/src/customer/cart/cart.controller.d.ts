import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(customerId: string): Promise<any[]>;
    addItem(body: any): Promise<any>;
    updateQty(id: string, body: {
        qty: number;
    }): Promise<{
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
    clearCart(customerId: string): Promise<{
        success: boolean;
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
}
