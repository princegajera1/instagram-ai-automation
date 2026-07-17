import { Module } from '@nestjs/common';
import { InstagramPublishController } from './instagram-publish.controller';
import { InstagramPublishService } from './instagram-publish.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
  controllers: [InstagramPublishController],
  providers: [InstagramPublishService, PrismaService],
  exports: [InstagramPublishService],
})
export class InstagramPublishModule {}
