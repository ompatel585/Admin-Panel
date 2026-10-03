import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { AppException } from '../../common/exceptions/app.exception.js';
import {
  comparePassword,
  hashPassword,
} from '../../common/utils/password.util.js';
import type { AppConfig } from '../../config/configuration.js';
import { MailService } from '../mail/mail.service.js';
import { RolesRepository } from '../roles/roles.repository.js';
import type { UserDocument } from '../users/schemas/user.schema.js';
import { UsersRepository } from '../users/users.repository.js';
import { AUTH_ERRORS } from './constants/auth.constants.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { ResetPasswordDto } from './dto/reset-password.dto.js';
import type { SignupDto } from './dto/signup.dto.js';
import { PasswordResetTokenRepository } from './password-reset-token.repository.js';
import type { AuthUser, JwtPayload } from './types/auth.type.js';

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly resetTokens: PasswordResetTokenRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** The very first account becomes Super Admin; everyone after gets the default role. */
  async signup(dto: SignupDto) {
    if (await this.usersRepository.exists({ email: dto.email })) {
      throw new AppException(AUTH_ERRORS.EMAIL_TAKEN);
    }

    const isFirstUser = (await this.usersRepository.count()) === 0;
    const role = isFirstUser
      ? await this.rolesRepository.findSuperAdmin()
      : await this.rolesRepository.findDefault();
    if (!role) throw new AppException(AUTH_ERRORS.DEFAULT_ROLE_MISSING);

    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      role: role._id,
    });

    return this.startSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmailWithPassword(dto.email);

    // Same error for "no such user" and "wrong password": no account enumeration.
    if (!user || !(await comparePassword(dto.password, user.passwordHash))) {
      throw new AppException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }
    if (!user.isActive) throw new AppException(AUTH_ERRORS.ACCOUNT_DISABLED);

    await this.usersRepository.touchLastLogin(user._id);
    return this.startSession(user);
  }

  /** Always resolves, whether or not the email exists. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user || !user.isActive) return;

    await this.resetTokens.deleteAllForUser(user._id);

    const rawToken = randomBytes(32).toString('hex');
    const ttlMinutes = this.config.get('auth.passwordResetTtlMinutes', {
      infer: true,
    });
    await this.resetTokens.create({
      user: user._id,
      tokenHash: sha256(rawToken),
      expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
    });

    const frontendUrl = this.config.get('frontendUrl', { infer: true });
    this.mailService.sendPasswordReset(
      user.email,
      `${frontendUrl}/reset-password?token=${rawToken}`,
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const record = await this.resetTokens.findValidByHash(sha256(dto.token));
    if (!record) throw new AppException(AUTH_ERRORS.RESET_TOKEN_INVALID);

    await this.usersRepository.setPassword(
      record.user,
      await hashPassword(dto.password),
    );
    // Single use: burn every outstanding token for this user.
    await this.resetTokens.deleteAllForUser(record.user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findByIdWithPassword(userId);
    if (
      !user ||
      !(await comparePassword(dto.currentPassword, user.passwordHash))
    ) {
      throw new AppException(AUTH_ERRORS.CURRENT_PASSWORD_INCORRECT);
    }
    await this.usersRepository.setPassword(
      user._id,
      await hashPassword(dto.newPassword),
    );
  }

  /** Resolves a verified token to the caller, with permissions read fresh from the DB. */
  async resolveAuthUser(token: string): Promise<AuthUser> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new AppException(AUTH_ERRORS.SESSION_INVALID);
    }

    const user = await this.usersRepository.findAuthContext(payload.sub);
    if (!user) throw new AppException(AUTH_ERRORS.SESSION_INVALID);
    if (!user.isActive) throw new AppException(AUTH_ERRORS.ACCOUNT_DISABLED);
    return this.toAuthUser(user);
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.usersRepository.findAuthContext(userId);
    if (!user) throw new AppException(AUTH_ERRORS.SESSION_INVALID);
    return this.toAuthUser(user);
  }

  private async startSession(user: UserDocument) {
    const token = await this.jwtService.signAsync({
      sub: String(user._id),
    } satisfies JwtPayload);
    return { token, user: await this.getProfile(String(user._id)) };
  }

  private toAuthUser(user: UserDocument): AuthUser {
    const role = user.role as unknown as {
      _id: unknown;
      name: string;
      isSuperAdmin: boolean;
      isActive: boolean;
      permissions: { key: string }[];
    } | null;

    // A deactivated role grants nothing.
    const effective = role?.isActive ? role : null;

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: role
        ? {
            id: String(role._id),
            name: role.name,
            isSuperAdmin: Boolean(effective?.isSuperAdmin),
          }
        : null,
      permissions: (effective?.permissions ?? [])
        .filter(Boolean)
        .map((permission) => permission.key),
    };
  }
}
