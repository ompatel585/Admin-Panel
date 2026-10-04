import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  TENANT_PLANS,
  type TenantPlan,
} from '../constants/tenants.constants.js';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsOptional()
  @IsIn(TENANT_PLANS)
  plan?: TenantPlan;
}
