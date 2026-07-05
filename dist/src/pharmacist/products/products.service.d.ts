import { FirebaseService } from '../../shared/firebase/firebase.service';
export declare class ProductsService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    getPendingProducts(): Promise<{
        id: string;
    }[]>;
    getAllPharmacistProducts(): Promise<{
        id: string;
    }[]>;
    getCustomerProducts(): Promise<{
        stock: number;
        id: string;
    }[]>;
    approvePending(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    addProduct(body: any): Promise<{
        success: boolean;
        id: string;
        visibility: "customer" | "pharmacist_only";
    }>;
    updateVisibility(id: string, visibility: string): Promise<{
        success: boolean;
        id: string;
        visibility: string;
    }>;
    getProducts(category?: string): Promise<{
        stock: number;
        id: string;
    }[]>;
    private findProductDoc;
    decrementStock(productCode: string, quantity: number): Promise<{
        success: boolean;
        message: string;
        productCode?: undefined;
        before?: undefined;
        after?: undefined;
    } | {
        success: boolean;
        productCode: string;
        before: number;
        after: number;
        message?: undefined;
    }>;
    incrementStock(productCode: string, quantity: number): Promise<{
        success: boolean;
        message: string;
        productCode?: undefined;
        before?: undefined;
        after?: undefined;
    } | {
        success: boolean;
        productCode: string;
        before: number;
        after: number;
        message?: undefined;
    }>;
    private updateAdminProductStock;
}
