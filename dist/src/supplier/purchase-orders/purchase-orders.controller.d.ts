import { PurchaseOrdersService } from './purchase-orders.service';
import { ApproveOrderDto } from './dto/approve-order.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    getOrders(supplierId: string, status?: string): Promise<{
        id: string;
    }[]>;
    getOrderById(orderId: string): Promise<{
        id: string;
    }>;
    approveOrder(orderId: string, body: ApproveOrderDto): Promise<{
        success: boolean;
        message: string;
        orderId: string;
    }>;
    rejectOrder(orderId: string, body: RejectOrderDto): Promise<{
        success: boolean;
        message: string;
        orderId: string;
    }>;
}
