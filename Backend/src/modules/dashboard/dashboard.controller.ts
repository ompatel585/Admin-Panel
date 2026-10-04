import { Controller, Get, Query } from '@nestjs/common';
import { IsMongoId, IsOptional } from 'class-validator';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { DashboardService } from './dashboard.service.js';

class DashboardQueryDto {
  /** Admin only: look at one workspace instead of the whole platform. */
  @IsOptional()
  @IsMongoId()
  tenantId?: string;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  stats(@CurrentUser() user: AuthUser, @Query() query: DashboardQueryDto) {
    return this.dashboardService.stats(user, query.tenantId);
  }
}
