import { IsIn, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { SITE_STATUSES, type SiteStatus } from '../constants/sites.constants.js';

export class ListSitesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsOptional()
  @IsIn(SITE_STATUSES)
  status?: SiteStatus;
}
