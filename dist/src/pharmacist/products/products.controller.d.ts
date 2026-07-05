import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getProducts(category?: string): Promise<{
        stock: number;
        id: string;
    }[]>;
    getPendingProducts(): Promise<{
        id: string;
    }[]>;
    getAllPharmacistProducts(): Promise<{
        id: string;
    }[]>;
    addProduct(body: any): Promise<{
        success: boolean;
        id: string;
        visibility: "customer" | "pharmacist_only";
    }>;
    approvePending(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    updateVisibility(id: string, body: {
        visibility: string;
    }): Promise<{
        success: boolean;
        id: string;
        visibility: string;
    }>;
    decrementStock(productCode: string, body: {
        quantity: number;
    }): Promise<{
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
    incrementStock(productCode: string, body: {
        quantity: number;
    }): Promise<{
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
}
