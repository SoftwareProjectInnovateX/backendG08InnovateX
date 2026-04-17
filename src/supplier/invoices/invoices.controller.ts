import {
  Controller, Post, Body, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { GeneratePdfDto } from './dto/generate-pdf.dto';

@Controller('supplier/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // POST /supplier/invoices/generate-pdf
  // Called instead of generatePDF() in InvoicePayments.jsx
  // Returns a real downloadable PDF file
  @Post('generate-pdf')
  @HttpCode(HttpStatus.OK)
  async generatePdf(
    @Body() dto: GeneratePdfDto,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.invoicesService.generatePdf(dto);

    // Set headers so browser downloads it as a PDF file
    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${dto.invoiceNumber}.pdf"`,
      'Content-Length':       pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}