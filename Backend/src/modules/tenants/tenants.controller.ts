import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { AppException } from '../../common/exceptions/app.exception.js';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { PERMISSION_KEYS } from '../permissions/constants/permissions.constants.js';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator.js';
import {
  TENANT_ERRORS,
  TENANT_MESSAGES,
} from './constants/tenants.constants.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { ListTenantsQueryDto } from './dto/list-tenants-query.dto.js';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';
import { TenantsService } from './tenants.service.js';

const { READ, LIST, CREATE, UPDATE, DELETE, SUSPEND } = PERMISSION_KEYS.TENANTS;

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @RequirePermissions(LIST)
  @ResponseMessage(TENANT_MESSAGES.FETCHED)
  findAll(@Query() query: ListTenantsQueryDto) {
    return this.tenantsService.findAll(query);
  }

  /** Workspace picker for Admins creating records on behalf of a customer. */
  @Get('options')
  @RequirePermissions(LIST)
  findOptions() {
    return this.tenantsService.findOptions();
  }

  /** The signed-in user's own workspace. */
  @Get('current')
  @RequirePermissions(READ)
  current(@CurrentUser() user: AuthUser) {
    if (!user.tenant) throw new AppException(TENANT_ERRORS.NO_WORKSPACE);
    return this.tenantsService.findOne(user, user.tenant.id);
  }

  @Get(':id')
  @RequirePermissions(READ)
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.tenantsService.findOne(user, id);
  }

  @Post()
  @RequirePermissions(CREATE)
  @ResponseMessage(TENANT_MESSAGES.CREATED)
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(UPDATE)
  @ResponseMessage(TENANT_MESSAGES.UPDATED)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(user, id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions(SUSPEND)
  @ResponseMessage(TENANT_MESSAGES.STATUS_UPDATED)
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    return this.tenantsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(DELETE)
  @ResponseMessage(TENANT_MESSAGES.DELETED)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.tenantsService.remove(id);
  }
}
