import { AccountRequestsService } from './account-requests.service.js';
export declare class AccountRequestsController {
    private readonly service;
    constructor(service: AccountRequestsService);
    getAll(): Promise<{
        id: string;
    }[]>;
    approve(id: string): Promise<{
        success: boolean;
        message: string;
        tempPassword: string;
    }>;
    reject(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
