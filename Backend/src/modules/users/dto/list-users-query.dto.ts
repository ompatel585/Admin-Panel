import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { toBoolean } from '../../../common/utils/query.util.js';

export class ListUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  roleId?: string;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}
