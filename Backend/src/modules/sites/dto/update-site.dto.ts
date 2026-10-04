import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CrawlSettingsDto } from './create-site.dto.js';

/** The URL is fixed once added: a different URL is a different website. */
export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CrawlSettingsDto)
  crawl?: CrawlSettingsDto;
}
