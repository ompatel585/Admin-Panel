import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from '../../../common/dto/password.rules.js';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsStrongPassword()
  password: string;
}
