import { Module } from '@nestjs/common';
import { MediaUploadController } from './media-upload.controller';
import { MediaUploadService } from './media-upload.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
  controllers: [MediaUploadController],
  providers: [MediaUploadService, PrismaService],
  exports: [MediaUploadService],
})
export class MediaUploadModule {}
