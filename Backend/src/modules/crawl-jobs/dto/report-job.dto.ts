import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  JOB_STAGES,
  type JobStage,
} from '../constants/crawl-jobs.constants.js';

/** Progress report sent by the crawl/index pipeline. Every field is optional. */
export class ReportJobDto {
  @IsOptional()
  @IsIn(['running', 'completed', 'failed'])
  status?: 'running' | 'completed' | 'failed';

  @IsOptional()
  @IsIn(JOB_STAGES)
  stage?: JobStage;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pagesDiscovered?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pagesCrawled?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  chunksCreated?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  error?: string;
}
