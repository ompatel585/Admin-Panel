import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from '../../../common/dto/password.rules.js';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsStrongPassword()
  newPassword: string;
}
