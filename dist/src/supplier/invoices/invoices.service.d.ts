import { GeneratePdfDto } from './dto/generate-pdf.dto';
export declare class InvoicesService {
    generatePdf(dto: GeneratePdfDto): Promise<Buffer>;
    private buildHtml;
}
