import { PartialType } from '@nestjs/swagger';
import { CreateDiscountProductDto } from './create-discount-product.dto';

export class UpdateDiscountProductDto extends PartialType(CreateDiscountProductDto) {}