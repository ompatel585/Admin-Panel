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
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import {
  PERMISSION_KEYS,
  PERMISSION_MESSAGES,
} from './constants/permissions.constants.js';
import {
  RequireAnyPermission,
  RequirePermissions,
} from './decorators/require-permissions.decorator.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { ListPermissionsQueryDto } from './dto/list-permissions-query.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { PermissionKeyPipe } from './pipes/permission-key.pipe.js';
import { PermissionsService } from './permissions.service.js';

const { READ, CREATE, UPDATE, DELETE } = PERMISSION_KEYS.PERMISSIONS;

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions(READ)
  @ResponseMessage(PERMISSION_MESSAGES.FETCHED)
  findAll(@Query() query: ListPermissionsQueryDto) {
    return this.permissionsService.findAll(query);
  }

  /** The role editor needs the full tree, so `roles.read` is enough too. */
  @Get('tree')
  @RequireAnyPermission(READ, PERMISSION_KEYS.ROLES.READ)
  @ResponseMessage(PERMISSION_MESSAGES.FETCHED)
  findTree() {
    return this.permissionsService.findTree();
  }

  @Get('by-key/:key')
  @RequirePermissions(READ)
  findByKey(@Param('key', PermissionKeyPipe) key: string) {
    return this.permissionsService.findByKey(key);
  }

  @Get(':id')
  @RequirePermissions(READ)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.permissionsService.findById(id);
  }

  @Post()
  @RequirePermissions(CREATE)
  @ResponseMessage(PERMISSION_MESSAGES.CREATED)
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(UPDATE)
  @ResponseMessage(PERMISSION_MESSAGES.UPDATED)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(DELETE)
  @ResponseMessage(PERMISSION_MESSAGES.DELETED)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.permissionsService.remove(id);
  }
}
