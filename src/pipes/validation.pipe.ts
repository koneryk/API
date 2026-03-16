import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { validate } from 'class-validator';
import { ValidationException } from '../exception/validation.exception';
import { plainToClass } from 'class-transformer';


@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {

    // @ts-ignore
    const obj = plainToClass(metadata.metatype, value);
    const errors = await validate(obj);


    return value
  }
}