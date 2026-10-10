import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
/** Font stacks are written into the embedded widget's CSS, so only plain font names are allowed. */
const SAFE_FONT = /^[A-Za-z0-9 ,'_-]+$/;
const color = { message: 'must be a hex color such as #4f46e5' };

export class WidgetThemeDto {
  @IsOptional() @Matches(HEX_COLOR, color) accent?: string;
  @IsOptional() @Matches(HEX_COLOR, color) accentForeground?: string;
  @IsOptional() @Matches(HEX_COLOR, color) surface?: string;
  @IsOptional() @Matches(HEX_COLOR, color) raised?: string;
  @IsOptional() @Matches(HEX_COLOR, color) foreground?: string;
  @IsOptional() @Matches(HEX_COLOR, color) muted?: string;
  @IsOptional() @Matches(HEX_COLOR, color) border?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(32)
  radius?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(SAFE_FONT, { message: 'font may only contain letters, numbers, spaces, commas and hyphens' })
  font?: string;
}

export class WidgetCopyDto {
  @IsOptional() @IsString() @MaxLength(60) title?: string;
  @IsOptional() @IsString() @MaxLength(120) subtitle?: string;
  @IsOptional() @IsString() @MaxLength(300) greeting?: string;
  @IsOptional() @IsString() @MaxLength(100) placeholder?: string;
  @IsOptional() @IsString() @MaxLength(300) offlineMessage?: string;
  @IsOptional() @IsString() @MaxLength(4) avatarText?: string;
}

export class WidgetLauncherDto {
  @IsOptional()
  @IsIn(['bottom-right', 'bottom-left'])
  position?: 'bottom-right' | 'bottom-left';

  @IsOptional() @IsInt() @Min(0) @Max(100) offset?: number;
  @IsOptional() @IsInt() @Min(40) @Max(120) width?: number;
  @IsOptional() @IsInt() @Min(40) @Max(120) height?: number;
}

export class WidgetFeaturesDto {
  @IsOptional() @IsBoolean() streaming?: boolean;
  @IsOptional() @IsBoolean() showSources?: boolean;
}

/** Appearance and texts of the embedded widget; every field is optional so one panel can save alone. */
export class UpdateWidgetDto {
  @IsOptional() @ValidateNested() @Type(() => WidgetThemeDto) theme?: WidgetThemeDto;
  @IsOptional() @ValidateNested() @Type(() => WidgetCopyDto) copy?: WidgetCopyDto;
  @IsOptional() @ValidateNested() @Type(() => WidgetLauncherDto) launcher?: WidgetLauncherDto;
  @IsOptional() @ValidateNested() @Type(() => WidgetFeaturesDto) features?: WidgetFeaturesDto;
}
