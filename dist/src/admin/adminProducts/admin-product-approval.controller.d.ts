import { AdminProductApprovalService } from './admin-product-approval.service.js';
declare class RejectDto {
    reason?: string;
}
export declare class AdminProductApprovalController {
    private readonly approvalService;
    constructor(approvalService: AdminProductApprovalService);
    getAllPending(): Promise<{
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
    approve(id: string): Promise<{
        success: boolean;
        productId: string;
        productCode: string;
    }>;
    reject(id: string, body: RejectDto): Promise<{
        success: boolean;
    }>;
}
export {};
