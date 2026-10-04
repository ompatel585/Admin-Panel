import { IsIn, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import {
  JOB_STATUSES,
  type JobStatus,
} from '../constants/crawl-jobs.constants.js';

export class ListCrawlJobsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsOptional()
  @IsMongoId()
  siteId?: string;

  @IsOptional()
  @IsIn(JOB_STATUSES)
  status?: JobStatus;
}
