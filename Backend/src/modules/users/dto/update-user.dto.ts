import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

/** Profile fields only; role and status have dedicated, separately-guarded endpoints. */
export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['name', 'email'] as const),
) {}
