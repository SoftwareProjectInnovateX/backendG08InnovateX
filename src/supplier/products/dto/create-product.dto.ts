import { IsString, IsNumber, IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Medicine', 'Baby Item', 'Skincare', 'Medical Equipment', 'Supplements'])
  category: string;

  @IsNumber()
  wholesalePrice: number;

  @IsNumber()
  @IsOptional()
  stock: number = 0;        // Stock Supplied to MediCareX

  @IsNumber()
  @IsOptional()
  minStock: number = 0;     // Remaining Stock with supplier

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;
}