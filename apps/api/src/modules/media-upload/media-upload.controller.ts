import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { MediaUploadService } from './media-upload.service';
import { memStorage } from './mem-storage';

@Controller('api/media')
export class MediaUploadController {
  constructor(private readonly mediaUploadService: MediaUploadService) {}

  @Post('upload')
  @UseGuards(ClerkAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memStorage }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Attach a file with field name "file".');
    }

    const userId = req.user?.userId || req.user?.sub || 'anonymous';
    return this.mediaUploadService.uploadFile(file, userId);
  }
}
