import { IsMongoId } from 'class-validator';

export class UpdateUserRoleDto {
  @IsMongoId()
  roleId: string;
}
