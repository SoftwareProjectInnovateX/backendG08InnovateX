import { IsString, IsNumber, IsOptional, IsIn, IsNotEmpty } from 'class-validator';

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
  stock?: number; // Stock Supplied to MediCareX

  @IsNumber()
  @IsOptional()
<<<<<<< HEAD
  minStock?: number; // Remaining Stock with supplier

  @IsString()
=======
  minStock?: number;     
  
 
>>>>>>> product-handling
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;
}
