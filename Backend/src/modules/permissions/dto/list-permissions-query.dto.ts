import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { toBoolean } from '../../../common/utils/query.util.js';
import type { PermissionTypeFilter } from '../types/permission.type.js';

export class ListPermissionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  @IsIn(['module', 'sub'])
  type?: PermissionTypeFilter;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}
