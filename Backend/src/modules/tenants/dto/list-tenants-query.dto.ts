import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import {
  TENANT_PLANS,
  TENANT_STATUSES,
  type TenantPlan,
  type TenantStatus,
} from '../constants/tenants.constants.js';

export class ListTenantsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(TENANT_STATUSES)
  status?: TenantStatus;

  @IsOptional()
  @IsIn(TENANT_PLANS)
  plan?: TenantPlan;
}
