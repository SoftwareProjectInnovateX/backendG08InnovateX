import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  @IsIn([
    'Medicine',
    'Baby Item',
    'Skincare',
    'Medical Equipment',
    'Supplements',
  ])
  category?: string;

  @IsNumber()
  @IsOptional()
  wholesalePrice?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsNumber()
  @IsOptional()
  minStock?: number;

  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;
}