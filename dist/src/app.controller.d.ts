import { AppService } from './app.service';
import { FirebaseService } from './shared/firebase/firebase.service.js';
export declare class AppController {
    private readonly appService;
    private readonly firebaseService;
    constructor(appService: AppService, firebaseService: FirebaseService);
    getHello(): string;
    setAdmin(): Promise<{
        success: boolean;
    }>;
    checkAdmin(): Promise<{
        customClaims: {
            [key: string]: any;
        } | undefined;
    }>;
}
