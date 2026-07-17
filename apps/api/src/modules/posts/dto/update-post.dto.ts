import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { PostType, PostStatus } from '@prisma/client';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  hashtags?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  firstComment?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaFileIds?: string[];
}
