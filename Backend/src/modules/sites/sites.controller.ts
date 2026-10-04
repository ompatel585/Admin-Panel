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
import { IsMongoId, IsOptional } from 'class-validator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { PERMISSION_KEYS } from '../permissions/constants/permissions.constants.js';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator.js';
import { SITE_MESSAGES } from './constants/sites.constants.js';
import { CreateSiteDto } from './dto/create-site.dto.js';
import { ListSitesQueryDto } from './dto/list-sites-query.dto.js';
import { UpdateSiteDto } from './dto/update-site.dto.js';
import { SitesService } from './sites.service.js';

const { READ, CREATE, UPDATE, DELETE, CRAWL } = PERMISSION_KEYS.SITES;

class SiteOptionsQueryDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;
}

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @RequirePermissions(READ)
  @ResponseMessage(SITE_MESSAGES.FETCHED)
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListSitesQueryDto) {
    return this.sitesService.findAll(user, query);
  }

  @Get('options')
  @RequirePermissions(READ)
  findOptions(
    @CurrentUser() user: AuthUser,
    @Query() query: SiteOptionsQueryDto,
  ) {
    return this.sitesService.findOptions(user, query.tenantId);
  }

  @Get(':id')
  @RequirePermissions(READ)
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.sitesService.findOne(user, id);
  }

  @Post()
  @RequirePermissions(CREATE)
  @ResponseMessage(SITE_MESSAGES.CREATED)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSiteDto) {
    return this.sitesService.create(user, dto);
  }

  @Patch(':id')
  @RequirePermissions(UPDATE)
  @ResponseMessage(SITE_MESSAGES.UPDATED)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSiteDto,
  ) {
    return this.sitesService.update(user, id, dto);
  }

  @Post(':id/crawl')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(CRAWL)
  @ResponseMessage(SITE_MESSAGES.CRAWL_QUEUED)
  recrawl(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.sitesService.recrawl(user, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(DELETE)
  @ResponseMessage(SITE_MESSAGES.DELETED)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.sitesService.remove(user, id);
  }
}
