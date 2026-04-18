import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class GeneratePdfDto {
  @IsString()
  invoiceNumber: string;

  @IsString()
  pharmacy: string;

  @IsString()
  @IsIn(['INITIAL', 'FINAL'])
  invoiceType: string;

  @IsString()
  @IsOptional()
  invoiceLabel?: string;

  @IsString()
  @IsIn(['Paid', 'Pending', 'Overdue'])
  paymentStatus: string;

  @IsString()
  invoiceDate: string;

  @IsString()
  dueDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  totalOrderAmount?: number;

  @IsNumber()
  @IsOptional()
  paidAmount?: number;

  @IsString()
  @IsOptional()
  paidDate?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  paymentNote?: string;
}
