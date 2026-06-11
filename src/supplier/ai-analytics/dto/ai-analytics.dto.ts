export interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceRecord {
  id: string;
  productName: string;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  invoiceType: 'INITIAL' | 'FINAL';
  invoiceDate: string;
  dueDate: string;
  paidDate: string | null;
  items: InvoiceItem[];
  pharmacy: string;
  orderId: string;
}

export class AnalyseInvoicesDto {
  supplierId!: string;
  invoices!: InvoiceRecord[];
}