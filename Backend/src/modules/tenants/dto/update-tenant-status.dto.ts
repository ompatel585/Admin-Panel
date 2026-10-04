import { IsIn } from 'class-validator';
import {
  TENANT_STATUSES,
  type TenantStatus,
} from '../constants/tenants.constants.js';

export class UpdateTenantStatusDto {
  @IsIn(TENANT_STATUSES)
  status: TenantStatus;
}
