import { IsMongoId, IsOptional } from 'class-validator';

export class UpdateUserRoleDto {
  @IsMongoId()
  roleId: string;

  /** Needed when turning an Admin (who has no workspace) into a User. */
  @IsOptional()
  @IsMongoId()
  tenantId?: string;
}
