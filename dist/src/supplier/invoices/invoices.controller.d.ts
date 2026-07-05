import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    generatePdf(dto: GeneratePdfDto, res: Response): Promise<void>;
}
