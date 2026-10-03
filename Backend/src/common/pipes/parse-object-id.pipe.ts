import { Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { COMMON_ERRORS } from '../constants/common.constants.js';
import { AppException } from '../exceptions/app.exception.js';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isValidObjectId(value)) {
      throw new AppException(COMMON_ERRORS.INVALID_ID);
    }
    return value;
  }
}
