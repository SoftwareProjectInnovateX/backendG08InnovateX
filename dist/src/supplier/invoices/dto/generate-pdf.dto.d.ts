export declare class InvoiceItemDto {
    productName: string;
    quantity: number;
    unitPrice: number;
}
export declare class GeneratePdfDto {
    invoiceNumber: string;
    pharmacy: string;
    invoiceType: string;
    invoiceLabel?: string;
    paymentStatus: string;
    invoiceDate: string;
    dueDate: string;
    items: InvoiceItemDto[];
    totalAmount: number;
    subtotal?: number;
    taxRate?: number;
    taxAmount?: number;
    totalOrderAmount?: number;
    paidAmount?: number;
    paidDate?: string;
    paymentMethod?: string;
    paymentNote?: string;
}
