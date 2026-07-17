import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { PostType, PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  instagramAccountId!: string;

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

  @IsEnum(PostType)
  type!: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaFileIds?: string[]; // IDs of already-uploaded MediaFile records
}
