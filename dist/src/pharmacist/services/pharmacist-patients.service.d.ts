import { FirebaseService } from '../../shared/firebase/firebase.service.js';
export declare class PharmacistPatientsService {
    private readonly firebaseService;
    private readonly collectionName;
    constructor(firebaseService: FirebaseService);
    getPatients(): Promise<{
        firebaseId: string;
        id: string;
    }[]>;
    addPatient(patientData: any): Promise<any>;
    updatePatient(id: string, updateData: any): Promise<any>;
}
