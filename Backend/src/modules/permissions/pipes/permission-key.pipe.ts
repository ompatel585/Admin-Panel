import { Injectable, PipeTransform } from '@nestjs/common';
import { AppException } from '../../../common/exceptions/app.exception.js';
import {
  PERMISSION_ERRORS,
  PERMISSION_KEY_REGEX,
} from '../constants/permissions.constants.js';

/** Normalises and validates a permission key received as a route param. */
@Injectable()
export class PermissionKeyPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const key = value?.trim().toLowerCase();
    if (!key || !PERMISSION_KEY_REGEX.test(key)) {
      throw new AppException(PERMISSION_ERRORS.INVALID_KEY);
    }
    return key;
  }
}
