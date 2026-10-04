import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  RECRAWL_SCHEDULES,
  type RecrawlSchedule,
} from '../constants/sites.constants.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CrawlSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20000)
  maxPages?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxDepth?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  includePaths?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  excludePaths?: string[];

  @IsOptional()
  @IsBoolean()
  respectRobots?: boolean;

  @IsOptional()
  @IsIn(RECRAWL_SCHEDULES)
  recrawl?: RecrawlSchedule;
}

export class CreateSiteDto {
  /** Admins pick the workspace; everyone else is pinned to their own. */
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(trim)
  name: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(500)
  @Transform(trim)
  url: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CrawlSettingsDto)
  crawl?: CrawlSettingsDto;
}
