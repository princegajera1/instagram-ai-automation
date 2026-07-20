import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../../services/prisma.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    // Register the queues so they can be injected into AdminService
    BullModule.registerQueue({ name: 'post-publish-queue' }, { name: 'post-warning-queue' }),
  ],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
})
export class AdminModule {}
