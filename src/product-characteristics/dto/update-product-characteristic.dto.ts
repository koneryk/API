import { PartialType } from '@nestjs/swagger';
import { CreateProductCharacteristicDto } from './create-product-characteristic.dto';

export class UpdateProductCharacteristicDto extends PartialType(CreateProductCharacteristicDto) {}