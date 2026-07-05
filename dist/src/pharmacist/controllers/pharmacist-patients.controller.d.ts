import { PharmacistPatientsService } from '../services/pharmacist-patients.service.js';
export declare class PharmacistPatientsController {
    private readonly patientsService;
    constructor(patientsService: PharmacistPatientsService);
    getPatients(): Promise<{
        firebaseId: string;
        id: string;
    }[]>;
    addPatient(patientData: any): Promise<any>;
    updatePatient(id: string, updateData: any): Promise<any>;
}
