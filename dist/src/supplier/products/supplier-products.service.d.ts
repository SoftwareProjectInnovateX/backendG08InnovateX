import { FirebaseService } from '../../shared/firebase/firebase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class SupplierProductsService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    getProducts(supplierId: string): Promise<{
        id: string;
    }[]>;
    getPendingProducts(supplierId: string): Promise<{
        createdAt: {
            _seconds: any;
        } | null;
        approvedAt: {
            _seconds: any;
        } | null;
        rejectedAt: {
            _seconds: any;
        } | null;
        id: string;
    }[]>;
    createProduct(supplierId: string, supplierName: string, dto: CreateProductDto): Promise<{
        success: boolean;
        pendingProductId: string;
    }>;
    updateProduct(productId: string, dto: UpdateProductDto): Promise<{
        success: boolean;
    }>;
    deleteProduct(productId: string): Promise<{
        success: boolean;
    }>;
}
