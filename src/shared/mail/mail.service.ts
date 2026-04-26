import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface ApprovalEmailData {
  to: string;
  name: string;
  role: 'supplier' | 'pharmacist';
  tempPassword: string;
}

interface RejectionEmailData {
  to: string;
  name: string;
  role: 'supplier' | 'pharmacist';
}

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendApprovalEmail(data: ApprovalEmailData): Promise<void> {
    const roleLabel = data.role === 'supplier' ? 'Supplier' : 'Pharmacist';
    const loginUrl = 'http://localhost:5173/login';

    await this.mailer.sendMail({
      to: data.to,
      subject: `MediCareX Account Approved — Welcome, ${data.name}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f9ff; margin: 0; padding: 0; }
            .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff;
                       border-radius: 16px; overflow: hidden;
                       box-shadow: 0 4px 24px rgba(30,64,175,0.10); }
            .header  { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                       padding: 36px 40px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px; }
            .header p  { color: #bfdbfe; margin: 6px 0 0; font-size: 14px; }
            .body    { padding: 36px 40px; }
            .greeting { font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 12px; }
            .message  { color: #475569; font-size: 15px; line-height: 1.7; }
            .credentials { background: #f0f7ff; border: 1.5px solid #bfdbfe;
                           border-radius: 10px; padding: 20px 24px; margin: 24px 0; }
            .credentials p  { margin: 6px 0; font-size: 14px; color: #334155; }
            .credentials strong { color: #1e3a8a; }
            .badge   { display: inline-block; background: #dbeafe; color: #1d4ed8;
                       font-size: 12px; font-weight: 700; padding: 4px 12px;
                       border-radius: 99px; letter-spacing: 0.5px; margin-bottom: 16px; }
            .btn     { display: inline-block; margin-top: 24px; padding: 14px 32px;
                       background: linear-gradient(135deg, #1e3a8a, #3b82f6);
                       color: #ffffff; text-decoration: none; border-radius: 10px;
                       font-weight: 700; font-size: 15px; }
            .warning { background: #fffbeb; border-left: 4px solid #f59e0b;
                       padding: 12px 16px; border-radius: 6px; margin-top: 20px;
                       font-size: 13px; color: #92400e; }
            .footer  { background: #f8fafc; padding: 20px 40px; text-align: center;
                       font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>MediCareX</h1>
              <p>Pharmacy Supply Chain Management</p>
            </div>
            <div class="body">
              <span class="badge">${roleLabel} Account</span>
              <p class="greeting">Welcome to MediCareX, ${data.name}!</p>
              <p class="message">
                We're pleased to inform you that your <strong>${roleLabel}</strong> account
                has been <strong style="color:#16a34a;">approved</strong> by our admin team.
                You can now log in to access the MediCareX platform.
              </p>
              <div class="credentials">
                <p><strong>Your login credentials:</strong></p>
                <p><strong>Email:</strong> ${data.to}</p>
                <p><strong>Temporary Password:</strong>
                   <code style="background:#e0f2fe;padding:2px 8px;border-radius:4px;
                                font-size:14px;color:#0369a1;">${data.tempPassword}</code>
                </p>
              </div>
              <div class="warning">
                Please change your password immediately after logging in for security.
              </div>
              <div style="text-align:center;">
                <a href="${loginUrl}" class="btn">Log In to MediCareX →</a>
              </div>
            </div>
            <div class="footer">
              ${new Date().getFullYear()} MediCareX · This is an automated message, please do not reply.
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendRejectionEmail(data: RejectionEmailData): Promise<void> {
    const roleLabel = data.role === 'supplier' ? 'Supplier' : 'Pharmacist';

    await this.mailer.sendMail({
      to: data.to,
      subject: `MediCareX Account Request Update — ${data.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f9ff; margin: 0; padding: 0; }
            .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff;
                       border-radius: 16px; overflow: hidden;
                       box-shadow: 0 4px 24px rgba(30,64,175,0.10); }
            .header  { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                       padding: 36px 40px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px; }
            .header p  { color: #bfdbfe; margin: 6px 0 0; font-size: 14px; }
            .body    { padding: 36px 40px; }
            .greeting { font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 12px; }
            .message  { color: #475569; font-size: 15px; line-height: 1.7; }
            .badge   { display: inline-block; background: #fee2e2; color: #b91c1c;
                       font-size: 12px; font-weight: 700; padding: 4px 12px;
                       border-radius: 99px; letter-spacing: 0.5px; margin-bottom: 16px; }
            .info-box { background: #fef9f0; border-left: 4px solid #f59e0b;
                        padding: 14px 18px; border-radius: 6px; margin: 20px 0;
                        font-size: 14px; color: #78350f; line-height: 1.6; }
            .footer  { background: #f8fafc; padding: 20px 40px; text-align: center;
                       font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>MediCareX</h1>
              <p>Pharmacy Supply Chain Management</p>
            </div>
            <div class="body">
              <span class="badge">Application Update</span>
              <p class="greeting">Dear ${data.name},</p>
              <p class="message">
                Thank you for your interest in joining MediCareX as a <strong>${roleLabel}</strong>.
                After reviewing your application, we regret to inform you that we are
                <strong style="color:#dc2626;">unable to approve</strong> your account at this time.
              </p>
              <div class="info-box">
                If you believe this decision was made in error or you would like to
                resubmit your application with updated information, please contact our
                support team or re-register with the correct details.
              </div>
              <p class="message">
                We appreciate your understanding and hope to work with you in the future.
              </p>
            </div>
            <div class="footer">
              ${new Date().getFullYear()} MediCareX · This is an automated message, please do not reply.
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendProductApprovedEmail(data: {
    to: string;
    supplierName: string;
    productName: string;
    productCode: string;
  }): Promise<void> {
    await this.mailer.sendMail({
      to: data.to,
      subject: `Product Approved: ${data.productName}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f9ff; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff;
                     border-radius: 16px; overflow: hidden;
                     box-shadow: 0 4px 24px rgba(30,64,175,0.10); }
          .header  { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                     padding: 36px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px; }
          .header p  { color: #bfdbfe; margin: 6px 0 0; font-size: 14px; }
          .body    { padding: 36px 40px; }
          .greeting { font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 12px; }
          .message  { color: #475569; font-size: 15px; line-height: 1.7; }
          .badge   { display: inline-block; background: #dcfce7; color: #16a34a;
                     font-size: 12px; font-weight: 700; padding: 4px 12px;
                     border-radius: 99px; letter-spacing: 0.5px; margin-bottom: 16px; }
          .credentials { background: #f0fdf4; border: 1.5px solid #bbf7d0;
                         border-radius: 10px; padding: 20px 24px; margin: 24px 0; }
          .credentials p  { margin: 6px 0; font-size: 14px; color: #334155; }
          .credentials strong { color: #15803d; }
          .footer  { background: #f8fafc; padding: 20px 40px; text-align: center;
                     font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>MediCareX</h1>
            <p>Pharmacy Supply Chain Management</p>
          </div>
          <div class="body">
            <span class="badge">Product Approved</span>
            <p class="greeting">Great news, ${data.supplierName}!</p>
            <p class="message">
              Your product submission has been <strong style="color:#16a34a;">approved</strong>
              by our admin team and is now live in the pharmacist inventory system.
            </p>
            <div class="credentials">
              <p><strong>Product Name:</strong> ${data.productName}</p>
              <p><strong>Product Code:</strong>
                <code style="background:#dcfce7;padding:2px 8px;border-radius:4px;
                             font-size:14px;color:#15803d;">${data.productCode}</code>
              </p>
            </div>
            <p class="message">You can track your product's status from your supplier dashboard.</p>
          </div>
          <div class="footer">
            ${new Date().getFullYear()} MediCareX · This is an automated message, please do not reply.
          </div>
        </div>
      </body>
      </html>
    `,
    });
  }

  async sendProductRejectedEmail(data: {
    to: string;
    supplierName: string;
    productName: string;
    reason?: string;
  }): Promise<void> {
    await this.mailer.sendMail({
      to: data.to,
      subject: `Product Submission Update: ${data.productName}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f9ff; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff;
                     border-radius: 16px; overflow: hidden;
                     box-shadow: 0 4px 24px rgba(30,64,175,0.10); }
          .header  { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                     padding: 36px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px; }
          .header p  { color: #bfdbfe; margin: 6px 0 0; font-size: 14px; }
          .body    { padding: 36px 40px; }
          .greeting { font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 12px; }
          .message  { color: #475569; font-size: 15px; line-height: 1.7; }
          .badge   { display: inline-block; background: #fee2e2; color: #b91c1c;
                     font-size: 12px; font-weight: 700; padding: 4px 12px;
                     border-radius: 99px; letter-spacing: 0.5px; margin-bottom: 16px; }
          .reason-box { background: #fff7ed; border-left: 4px solid #f97316;
                        padding: 14px 18px; border-radius: 6px; margin: 20px 0;
                        font-size: 14px; color: #7c2d12; line-height: 1.6; }
          .footer  { background: #f8fafc; padding: 20px 40px; text-align: center;
                     font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>MediCareX</h1>
            <p>Pharmacy Supply Chain Management</p>
          </div>
          <div class="body">
            <span class="badge">Product Not Approved</span>
            <p class="greeting">Dear ${data.supplierName},</p>
            <p class="message">
              Your submission for <strong>${data.productName}</strong> has been
              <strong style="color:#dc2626;">rejected</strong> by our admin team.
            </p>
            ${
              data.reason
                ? `
            <div class="reason-box">
              <strong>Reason:</strong> ${data.reason}
            </div>`
                : ''
            }
            <p class="message">
              Please review the feedback, make the necessary corrections, and resubmit
              your product from your supplier dashboard.
            </p>
          </div>
          <div class="footer">
            ${new Date().getFullYear()} MediCareX · This is an automated message, please do not reply.
          </div>
        </div>
        </div>
      </body>
      </html>
    `,
    });
  }

  async sendInvoiceEmail(data: {
    to: string;
    customerName: string;
    orderId: string;
    address: string;
    phone: string;
    totalAmount: number;
    items?: any[];
  }): Promise<void> {
    const displayAmount = Number(data.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 });
    
    // 1. Email Body HTML (Clean, responsive for email clients)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f9ff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(30,64,175,0.10);">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 36px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px;">MediCareX</h1>
            <p style="color: #bfdbfe; margin: 6px 0 0;">Order Successful!</p>
          </div>
          <div style="padding: 36px 40px;">
            <h2 style="color: #1e3a8a; font-size: 20px;">Dear ${data.customerName},</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              Thank you for your order! Your payment for Order <strong>#${data.orderId}</strong> has been successfully processed.
            </p>
            <div style="background: #f8fafc; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Total Paid:</strong> Rs. ${displayAmount}</p>
            </div>
            <p style="color: #475569; font-size: 15px;">
              Please find your official invoice attached as a PDF to this email. You can download and keep it for your records.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            ${new Date().getFullYear()} MediCareX · Your Smart Pharmacy Solution
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. High-Quality PDF Template HTML
    const pdfTemplateHtml = `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 60px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; box-sizing: border-box; width: 794px; height: 1123px; background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a8a; padding-bottom: 30px; margin-bottom: 40px;">
              <div>
                  <h1 style="color: #1e3a8a; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1px;">MediCareX</h1>
                  <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">Your Smart Pharmacy Solution</p>
                  <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Colombo, Sri Lanka</p>
                  <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">contact@medicarex.lk | +94 112 345 678</p>
              </div>
              <div style="text-align: right;">
                  <h2 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Invoice</h2>
                  <div style="margin-top: 16px; font-size: 14px;">
                      <p style="margin: 4px 0;"><span style="color: #64748b; display: inline-block; width: 80px; text-align: left;">Invoice No:</span> <strong style="color: #1e3a8a;">#${data.orderId}</strong></p>
                      <p style="margin: 4px 0;"><span style="color: #64748b; display: inline-block; width: 80px; text-align: left;">Date:</span> <strong>${new Date().toLocaleDateString('en-GB')}</strong></p>
                      <p style="margin: 4px 0;"><span style="color: #64748b; display: inline-block; width: 80px; text-align: left;">Status:</span> <span style="color: #16a34a; font-weight: bold;">PAID (Online)</span></p>
                  </div>
              </div>
          </div>

          <div style="margin-bottom: 40px;">
              <h3 style="font-size: 16px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: inline-block;">Bill To</h3>
              <p style="margin: 0 0 6px; font-size: 18px; font-weight: bold; color: #1e3a8a;">${data.customerName}</p>
              ${data.address ? `<p style="margin: 0 0 4px; font-size: 15px; color: #334155;">${data.address}</p>` : ''}
              ${data.phone ? `<p style="margin: 0 0 4px; font-size: 15px; color: #334155;">Tel: ${data.phone}</p>` : ''}
              ${data.to ? `<p style="margin: 0 0 4px; font-size: 15px; color: #334155;">Email: ${data.to}</p>` : ''}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
              <thead>
                  <tr style="background-color: #1e3a8a; color: #ffffff;">
                      <th style="padding: 16px; text-align: left; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; width: 70%;">Description</th>
                      <th style="padding: 16px; text-align: right; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; width: 30%;">Amount</th>
                  </tr>
              </thead>
              <tbody>
                  ${data.items && data.items.length > 0 
                    ? data.items.map(item => {
                        const q = item.qty || item.quantity || 1;
                        const p = item.price || (item.total / q) || 0;
                        const itemTotal = (p * q).toLocaleString('en-US', { minimumFractionDigits: 2 });
                        return `
                          <tr style="border-bottom: 1px solid #f1f5f9;">
                              <td style="padding: 16px; font-size: 15px;">
                                  <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 4px;">${item.name}</div>
                                  <div style="font-size: 11px; color: #64748b;">
                                      <span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-weight: bold;">QTY: ${q}</span>
                                      <span style="color: #94a3b8; margin-left: 8px;">× Rs. ${p.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                  </div>
                              </td>
                              <td style="padding: 16px; text-align: right; font-size: 16px; color: #1e3a8a; font-weight: bold;">
                                  Rs. ${itemTotal}
                              </td>
                          </tr>
                        `;
                    }).join('')
                    : `
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                          <td style="padding: 20px 16px; font-size: 16px; color: #334155;">Medicine Order Items & Services</td>
                          <td style="padding: 20px 16px; text-align: right; font-size: 16px; color: #1e3a8a; font-weight: bold;">
                              Rs. ${(parseFloat(displayAmount) - 400).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                      </tr>
                    `
                  }
              </tbody>
              <tfoot style="background-color: #f8fafc;">
                  <tr>
                      <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #64748b; font-weight: bold;">Subtotal:</td>
                      <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #334155; font-weight: bold;">
                          Rs. ${(parseFloat(displayAmount) - 400).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                  </tr>
                  <tr>
                      <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #059669; font-weight: bold;">
                          Shipping Charge (Flat Rate):
                      </td>
                      <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #059669; font-weight: bold;">
                          Rs. 400.00
                      </td>
                  </tr>
                  <tr style="border-top: 2px solid #e2e8f0;">
                      <td style="padding: 24px 16px; text-align: right; font-size: 18px; font-weight: bold; color: #0f172a;">Total Paid:</td>
                      <td style="padding: 24px 16px; text-align: right; font-size: 24px; font-weight: 900; color: #1e3a8a;">
                          Rs. ${displayAmount}
                      </td>
                  </tr>
              </tfoot>
          </table>

          <div style="position: absolute; bottom: 60px; left: 60px; right: 60px;">
              <div style="text-align: center; margin-bottom: 40px;">
                  <p style="font-size: 18px; color: #1e3a8a; font-weight: bold; margin-bottom: 8px;">Thank You for Your Business!</p>
                  <p style="font-size: 14px; color: #64748b;">If you have any questions concerning this invoice, please contact our support team.</p>
              </div>
              <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8;">
                  <span>Generated automatically by MediCareX System</span>
                  <span>Page 1 of 1</span>
              </div>
          </div>
      </body>
      </html>
    `;

    // 3. Generate PDF Buffer using Puppeteer
    let pdfBuffer: Buffer | null = null;
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(pdfTemplateHtml, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
    } catch (err) {
      console.error("Failed to generate PDF invoice:", err);
      // Fallback: send email without attachment if Puppeteer fails
    }

    // 4. Send Email with Nodemailer
    const mailOptions: any = {
      to: data.to,
      subject: `MediCareX Invoice - Order #${data.orderId}`,
      html: emailHtml,
    };

    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: `Invoice_${data.orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ];
    }

    try {
      await this.mailer.sendMail(mailOptions);
      console.log(`Invoice email sent to ${data.to} for order ${data.orderId}`);
    } catch (err) {
      console.error(`Failed to send invoice email to ${data.to}:`, err);
    }
  }
}

