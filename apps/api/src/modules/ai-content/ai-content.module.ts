import { Module } from '@nestjs/common';
import { AiContentController } from './ai-content.controller';
import { AiCaptionService } from './ai-caption.service';
import { BestTimeService } from './best-time-predictor.service';
import { ContentCalendarService } from './content-calendar.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
  controllers: [AiContentController],
  providers: [AiCaptionService, BestTimeService, ContentCalendarService, PrismaService],
  exports: [AiCaptionService, BestTimeService, ContentCalendarService],
})
export class AiContentModule {}
