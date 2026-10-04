import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(trim)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(trim)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
