import { Module } from '@nestjs/common';
import { CrawlJobsModule } from '../crawl-jobs/crawl-jobs.module.js';
import { PipelineKeyGuard } from './guards/pipeline-key.guard.js';
import { PipelineController } from './pipeline.controller.js';

@Module({
  imports: [CrawlJobsModule],
  controllers: [PipelineController],
  providers: [PipelineKeyGuard],
})
export class PipelineModule {}
