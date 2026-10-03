import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsStrongPassword } from '../../../common/dto/password.rules.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const trimLower = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(trim)
  name: string;

  @IsEmail()
  @Transform(trimLower)
  email: string;

  @IsStrongPassword()
  password: string;

  @IsMongoId()
  roleId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
