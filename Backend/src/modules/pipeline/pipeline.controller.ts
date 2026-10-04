import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { CrawlJobsService } from '../crawl-jobs/crawl-jobs.service.js';
import { ReportJobDto } from '../crawl-jobs/dto/report-job.dto.js';
import { PipelineKeyGuard } from './guards/pipeline-key.guard.js';

/**
 * The seam between this panel and the external crawl / chunk / embed
 * services. They authenticate with `x-pipeline-key`, not a user session.
 */
@Public()
@UseGuards(PipelineKeyGuard)
@Controller('pipeline')
export class PipelineController {
  constructor(private readonly jobs: CrawlJobsService) {}

  /** Takes the next queued crawl job (null when there is none). */
  @Post('jobs/claim')
  @HttpCode(HttpStatus.OK)
  claim() {
    return this.jobs.claim();
  }

  @Patch('jobs/:id')
  report(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ReportJobDto,
  ) {
    return this.jobs.report(id, dto);
  }
}
