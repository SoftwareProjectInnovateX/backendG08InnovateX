import { UsersService } from './users.service.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAll(): Promise<any[]>;
    getOne(id: string): Promise<{
        id: string;
    }>;
    addLoyalty(id: string, points: number): Promise<{
        success: boolean;
        loyaltyPoints: any;
    }>;
    updateStatus(id: string, status: string): Promise<{
        success: boolean;
        status: string;
    }>;
}
