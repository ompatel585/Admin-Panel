import { IsArray, IsMongoId } from 'class-validator';

export class UpdateRolePermissionsDto {
  /** The complete new set; anything not listed is revoked. */
  @IsArray()
  @IsMongoId({ each: true })
  permissionIds: string[];
}
