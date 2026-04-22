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
}
