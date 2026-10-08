import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import type { AppConfig } from '../../config/configuration.js';
import { AuthService } from './auth.service.js';
import { AUTH_COOKIE_NAME, AUTH_MESSAGES } from './constants/auth.constants.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { SignupDto } from './dto/signup.dto.js';
import { NormalizeEmailPipe } from './pipes/normalize-email.pipe.js';
import type { AuthUser } from './types/auth.type.js';
import { authCookieOptions } from './utils/cookie.util.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Public()
  @Post('signup')
  @ResponseMessage(AUTH_MESSAGES.SIGNED_UP)
  async signup(
    @Body(NormalizeEmailPipe) dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respondWithSession(res, await this.authService.signup(dto));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.LOGGED_IN)
  async login(
    @Body(NormalizeEmailPipe) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respondWithSession(res, await this.authService.login(dto));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.LOGGED_OUT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(
      AUTH_COOKIE_NAME,
      authCookieOptions(this.config.get('isProduction', { infer: true })),
    );
  }

  @Get('me')
  @ResponseMessage(AUTH_MESSAGES.PROFILE)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  /** Any signed-in person may edit their own name and email; no `users.*` permission needed. */
  @Patch('me')
  @ResponseMessage(AUTH_MESSAGES.PROFILE_UPDATED)
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body(NormalizeEmailPipe) dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.RESET_REQUESTED)
  forgotPassword(@Body(NormalizeEmailPipe) dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.PASSWORD_RESET)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.PASSWORD_CHANGED)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respondWithSession(
      res,
      await this.authService.changePassword(user.id, dto),
    );
  }

  private respondWithSession(
    res: Response,
    session: { token: string; user: AuthUser },
  ): AuthUser {
    res.cookie(
      AUTH_COOKIE_NAME,
      session.token,
      authCookieOptions(
        this.config.get('isProduction', { infer: true }),
        this.config.get('jwt.expiresInSeconds', { infer: true }),
      ),
    );
    return session.user;
  }
}
