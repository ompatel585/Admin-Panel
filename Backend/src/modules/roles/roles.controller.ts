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
  Put,
  Query,
} from '@nestjs/common';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { PERMISSION_KEYS } from '../permissions/constants/permissions.constants.js';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator.js';
import { ROLE_MESSAGES } from './constants/roles.constants.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { ListRolesQueryDto } from './dto/list-roles-query.dto.js';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { NormalizePermissionIdsPipe } from './pipes/normalize-permission-ids.pipe.js';
import { RolesService } from './roles.service.js';

const { READ, CREATE, UPDATE, DELETE } = PERMISSION_KEYS.ROLES;

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions(READ)
  @ResponseMessage(ROLE_MESSAGES.FETCHED)
  findAll(@Query() query: ListRolesQueryDto) {
    return this.rolesService.findAll(query);
  }

  /** Any signed-in user may list role names (id + name only) for dropdowns. */
  @Get('options')
  findOptions() {
    return this.rolesService.findOptions();
  }

  @Get(':id')
  @RequirePermissions(READ)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @RequirePermissions(CREATE)
  @ResponseMessage(ROLE_MESSAGES.CREATED)
  create(@CurrentUser() actor: AuthUser, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(actor, dto);
  }

  @Patch(':id')
  @RequirePermissions(UPDATE)
  @ResponseMessage(ROLE_MESSAGES.UPDATED)
  update(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(actor, id, dto);
  }

  @Put(':id/permissions')
  @RequirePermissions(UPDATE)
  @ResponseMessage(ROLE_MESSAGES.PERMISSIONS_UPDATED)
  updatePermissions(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(NormalizePermissionIdsPipe) dto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updatePermissions(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(DELETE)
  @ResponseMessage(ROLE_MESSAGES.DELETED)
  remove(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.rolesService.remove(actor, id);
  }
}
