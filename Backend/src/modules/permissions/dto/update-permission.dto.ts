import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto.js';

/** `key` and `parentId` are immutable: code and role assignments rely on them. */
export class UpdatePermissionDto extends PartialType(
  OmitType(CreatePermissionDto, ['key', 'parentId'] as const),
) {}
