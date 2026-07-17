import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../services/prisma.service';
import { PostStatus, NotificationType } from '@prisma/client';

@Injectable()
export class PostWarningSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PostWarningSchedulerService.name);

  constructor(
    @InjectQueue('post-warning-queue') private readonly warningQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async onApplicationBootstrap() {
    // Remove any existing repeatable warning jobs
    const existing = await this.warningQueue.getRepeatableJobs();
    for (const job of existing) {
      if (job.name === 'check-upcoming-posts') {
        await this.warningQueue.removeRepeatableByKey(job.key);
      }
    }

    // Run every 5 minutes
    await this.warningQueue.add(
      'check-upcoming-posts',
      {},
      { repeat: { pattern: '*/5 * * * *' } },
    );

    this.logger.log('Scheduled repeatable 5-minute upcoming post warning check');
  }

  async checkAndNotify() {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

    const upcomingPosts = await this.prisma.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledAt: { gte: now, lte: fiveMinutesLater },
        isDeleted: false,
      },
    });

    for (const post of upcomingPosts) {
      // Check if we already sent a warning for this post
      const existingNote = await this.prisma.notification.findFirst({
        where: {
          userId: post.userId,
          title: 'Post Publishing Soon',
          message: { contains: post.id },
        },
      });

      if (!existingNote) {
        await this.prisma.notification.create({
          data: {
            userId: post.userId,
            title: 'Post Publishing Soon',
            message: `Your post (ID: ${post.id}) is scheduled to publish in less than 5 minutes!`,
            type: NotificationType.SYSTEM,
          },
        });
        this.logger.log(`Sent 5-minute warning notification for post ${post.id}`);
      }
    }
  }
}
