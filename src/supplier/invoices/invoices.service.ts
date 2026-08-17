import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import * as puppeteer from 'puppeteer';

@Injectable()
export class InvoicesService {
  // POST /supplier/invoices/generate-pdf
  // Replaces generatePDF() in InvoicePayments.jsx
  // Returns a proper PDF buffer instead of opening a raw browser window
  async generatePdf(dto: GeneratePdfDto): Promise<Buffer> {
    try {
      const html = this.buildHtml(dto);

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new InternalServerErrorException('Failed to generate PDF');
    }
  }

  private buildHtml(invoice: GeneratePdfDto): string {
    const itemRows = (invoice.items || [])
      .map(
        (i) => `
        <tr>
          <td>${i.productName}</td>
          <td>${i.quantity}</td>
          <td>Rs.${Number(i.unitPrice).toFixed(2)}</td>
          <td>Rs.${(i.quantity * i.unitPrice).toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    const paymentInfo =
      invoice.paymentStatus === 'Paid'
        ? `<p>Paid: Rs.${Number(invoice.paidAmount || invoice.totalAmount).toFixed(2)} via ${invoice.paymentMethod} on ${invoice.paidDate}</p>`
        : `<p>Bank: Bank of America | Ref: ${invoice.invoiceNumber}</p>`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; background: white; }
            .container { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            h1 { font-size: 28px; color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #333; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .Paid    { background: #dcfce7; color: #166534; }
            .Pending { background: #fef3c7; color: #92400e; }
            .Overdue { background: #fee2e2; color: #991b1b; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { display: flex; justify-content: flex-end; margin: 8px 0; }
            .tl { width: 200px; text-align: right; padding-right: 20px; font-weight: bold; }
            .ta { width: 150px; text-align: right; }
            .grand { border-top: 2px solid #333; padding-top: 10px; font-size: 20px; font-weight: bold; color: #2563eb; }
            .info { background: #f9fafb; padding: 15px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <h1>MedSupply Co.</h1>
                <p>Supplier Portal</p>
                <p>123 Medical Street</p>
              </div>
              <div style="text-align:right">
                <h2>INVOICE</h2>
                <p><strong>#${invoice.invoiceNumber}</strong></p>
                <p><em>${invoice.invoiceLabel || invoice.invoiceType || ''}</em></p>
                <span class="badge ${invoice.paymentStatus}">${invoice.paymentStatus}</span>
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;margin:20px 0">
              <div><h3>Bill To</h3><p><strong>${invoice.pharmacy}</strong></p></div>
              <div>
                <h3>Details</h3>
                <p>Invoice: ${invoice.invoiceDate}</p>
                <p>Due: ${invoice.dueDate}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <div class="tl">Subtotal:</div>
                <div class="ta">Rs.${Number(invoice.subtotal || invoice.totalAmount).toFixed(2)}</div>
              </div>
              <div class="total-row">
                <div class="tl">Tax (${invoice.taxRate || 0}%):</div>
                <div class="ta">Rs.${Number(invoice.taxAmount || 0).toFixed(2)}</div>
              </div>
              <div class="total-row grand">
                <div class="tl">Total:</div>
                <div class="ta">Rs.${Number(invoice.totalAmount).toFixed(2)}</div>
              </div>
            </div>

            <div class="info">
              <h3>Payment ${invoice.paymentStatus === 'Paid' ? 'Info' : 'Instructions'}</h3>
              ${paymentInfo}
            </div>

            <div class="footer">
              <p>Thank you! Generated ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
