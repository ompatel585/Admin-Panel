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
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { NormalizePermissionIdsPipe } from '../roles/pipes/normalize-permission-ids.pipe.js';
import { PERMISSION_KEYS } from '../permissions/constants/permissions.constants.js';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator.js';
import { USER_MESSAGES } from './constants/users.constants.js';
import { PreventSelfAction } from './decorators/prevent-self-action.decorator.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PreventSelfActionGuard } from './guards/prevent-self-action.guard.js';
import { UsersService } from './users.service.js';

const { READ, CREATE, UPDATE, DELETE } = PERMISSION_KEYS.USERS;

@Controller('users')
@UseGuards(PreventSelfActionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(READ)
  @ResponseMessage(USER_MESSAGES.FETCHED)
  findAll(@CurrentUser() actor: AuthUser, @Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(actor, query);
  }

  @Get(':id')
  @RequirePermissions(READ)
  findOne(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.usersService.findById(actor, id);
  }

  @Post()
  @RequirePermissions(CREATE)
  @ResponseMessage(USER_MESSAGES.CREATED)
  create(@CurrentUser() actor: AuthUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(actor, dto);
  }

  @Patch(':id')
  @RequirePermissions(UPDATE)
  @ResponseMessage(USER_MESSAGES.UPDATED)
  update(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(actor, id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions(UPDATE)
  @PreventSelfAction()
  @ResponseMessage(USER_MESSAGES.STATUS_UPDATED)
  updateStatus(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(actor, id, dto);
  }

  @Put(':id/permissions')
  @RequirePermissions(UPDATE)
  @ResponseMessage(USER_MESSAGES.PERMISSIONS_UPDATED)
  updatePermissions(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(NormalizePermissionIdsPipe) dto: UpdateUserPermissionsDto,
  ) {
    return this.usersService.updatePermissions(actor, id, dto);
  }

  @Patch(':id/role')
  @RequirePermissions(UPDATE)
  @PreventSelfAction()
  @ResponseMessage(USER_MESSAGES.ROLE_UPDATED)
  updateRole(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(actor, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(DELETE)
  @PreventSelfAction()
  @ResponseMessage(USER_MESSAGES.DELETED)
  remove(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.usersService.remove(actor, id);
  }
}
