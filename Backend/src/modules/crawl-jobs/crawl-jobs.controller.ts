import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { PERMISSION_KEYS } from '../permissions/constants/permissions.constants.js';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator.js';
import { JOB_MESSAGES } from './constants/crawl-jobs.constants.js';
import { CrawlJobsService } from './crawl-jobs.service.js';
import { ListCrawlJobsQueryDto } from './dto/list-crawl-jobs-query.dto.js';

const { READ, CANCEL } = PERMISSION_KEYS.CRAWL_JOBS;

@Controller('crawl-jobs')
export class CrawlJobsController {
  constructor(private readonly jobsService: CrawlJobsService) {}

  @Get()
  @RequirePermissions(READ)
  @ResponseMessage(JOB_MESSAGES.FETCHED)
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ListCrawlJobsQueryDto,
  ) {
    return this.jobsService.findAll(user, query);
  }

  @Get(':id')
  @RequirePermissions(READ)
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.jobsService.findById(user, id);
  }

  @Post(':id/cancel')
  @RequirePermissions(CANCEL)
  @ResponseMessage(JOB_MESSAGES.CANCELLED)
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.jobsService.cancel(user, id);
  }
}
