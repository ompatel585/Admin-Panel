import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { PERMISSION_KEY_REGEX } from '../constants/permissions.constants.js';

const trimLower = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Transform(trim)
  name: string;

  @IsString()
  @MaxLength(80)
  @Matches(PERMISSION_KEY_REGEX, {
    message:
      'key must be lowercase segments separated by dots, e.g. reports.export',
  })
  @Transform(trimLower)
  key: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(trim)
  description?: string;

  /** Omit to create a top-level (module) permission. */
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
