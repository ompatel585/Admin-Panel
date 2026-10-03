import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto.js';

/** Every field optional. `permissionIds`, when present, replaces the role's full permission set. */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
