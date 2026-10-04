import { IsArray, IsMongoId } from 'class-validator';

export class UpdateUserPermissionsDto {
  /** The complete set granted directly to this user; anything not listed is revoked. */
  @IsArray()
  @IsMongoId({ each: true })
  permissionIds: string[];
}
