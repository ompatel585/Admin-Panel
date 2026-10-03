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
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { PERMISSION_KEYS } from '../permissions/constants/permissions.constants.js';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator.js';
import { USER_MESSAGES } from './constants/users.constants.js';
import { PreventSelfAction } from './decorators/prevent-self-action.decorator.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersQueryDto } from './dto/list-users-query.dto.js';
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
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(READ)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @RequirePermissions(CREATE)
  @ResponseMessage(USER_MESSAGES.CREATED)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(UPDATE)
  @ResponseMessage(USER_MESSAGES.UPDATED)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions(UPDATE)
  @PreventSelfAction()
  @ResponseMessage(USER_MESSAGES.STATUS_UPDATED)
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, dto);
  }

  @Patch(':id/role')
  @RequirePermissions(UPDATE)
  @PreventSelfAction()
  @ResponseMessage(USER_MESSAGES.ROLE_UPDATED)
  updateRole(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(DELETE)
  @PreventSelfAction()
  @ResponseMessage(USER_MESSAGES.DELETED)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.remove(id);
  }
}
