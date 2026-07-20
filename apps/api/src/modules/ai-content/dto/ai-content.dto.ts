import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';

export enum CaptionTone {
  FUNNY = 'Funny',
  PROFESSIONAL = 'Professional',
  MOTIVATIONAL = 'Motivational',
  BUSINESS = 'Business',
  LUXURY = 'Luxury',
  SHORT = 'Short',
  LONG = 'Long',
}

export class GenerateCaptionDto {
  @IsString()
  topic!: string;

  @IsEnum(CaptionTone)
  @IsOptional()
  tone?: CaptionTone = CaptionTone.PROFESSIONAL;
}

export class RewriteCaptionDto {
  @IsString()
  caption!: string;

  @IsEnum(CaptionTone)
  tone!: CaptionTone;
}

export class GenerateHashtagsDto {
  @IsString()
  captionOrTopic!: string;
}

export class EmojiSuggestDto {
  @IsString()
  caption!: string;
}

export class CtaSuggestDto {
  @IsString()
  topicOrGoal!: string;
}

export class SeoCaptionDto {
  @IsString()
  topic!: string;

  @IsOptional()
  @IsString()
  existingCaption?: string;
}

export class EngagementScoreDto {
  @IsString()
  caption!: string;

  @IsOptional()
  @IsString()
  hashtags?: string;
}

export class GenerateCalendarDto {
  @IsString()
  niche!: string;

  @IsInt()
  @Min(7)
  @Max(90)
  days!: number;
}

export class TrendingIdeasDto {
  @IsString()
  niche!: string;
}
