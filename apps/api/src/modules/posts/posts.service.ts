import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../services/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from '@prisma/client';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('post-publish-queue') private readonly publishQueue: Queue,
  ) {}

  private async schedulePublishJob(postId: string, scheduledAt: Date) {
    const delay = Math.max(scheduledAt.getTime() - Date.now(), 0);
    await this.publishQueue.add(
      'publish-post',
      { postId },
      {
        delay,
        jobId: `post-${postId}`,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    this.logger.log(`Scheduled publish job for post ${postId} in ${Math.round(delay / 1000)}s`);
  }

  private async removePublishJob(postId: string) {
    try {
      const job = await this.publishQueue.getJob(`post-${postId}`);
      if (job) {
        await job.remove();
        this.logger.log(`Removed publish job for post ${postId}`);
      }
    } catch (err: any) {
      this.logger.warn(`Failed to remove publish job for post ${postId}: ${err.message}`);
    }
  }

  async create(userId: string, dto: CreatePostDto) {
    const { mediaFileIds, scheduledAt, status, ...rest } = dto;

    const postStatus = status || PostStatus.DRAFT;

    if (postStatus === PostStatus.SCHEDULED && !scheduledAt) {
      throw new BadRequestException('scheduledAt is required when status is SCHEDULED');
    }

    const post = await this.prisma.post.create({
      data: {
        ...rest,
        userId,
        status: postStatus,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
      include: { mediaFiles: true },
    });

    // Link media files to this post
    if (mediaFileIds?.length) {
      await this.prisma.mediaFile.updateMany({
        where: { id: { in: mediaFileIds } },
        data: { postId: post.id },
      });
    }

    const postWithMedia = await this.prisma.post.findUnique({
      where: { id: post.id },
      include: { mediaFiles: { orderBy: { order: 'asc' } } },
    });

    if (postStatus === PostStatus.SCHEDULED && scheduledAt) {
      await this.schedulePublishJob(post.id, new Date(scheduledAt));
    }

    return postWithMedia;
  }

  async findAll(
    userId: string,
    filters: { status?: PostStatus; startDate?: string; endDate?: string; type?: string },
  ) {
    const where: any = { userId, isDeleted: false };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.startDate || filters.endDate) {
      where.scheduledAt = {};
      if (filters.startDate) where.scheduledAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.scheduledAt.lte = new Date(filters.endDate);
    }

    return this.prisma.post.findMany({
      where,
      include: { mediaFiles: { orderBy: { order: 'asc' } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { mediaFiles: { orderBy: { order: 'asc' } } },
    });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Access denied');
    return post;
  }

  async update(userId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.findOne(userId, postId);

    if (post.status === PostStatus.PUBLISHED) {
      throw new ForbiddenException('Cannot edit a published post');
    }

    const { mediaFileIds, scheduledAt, status, ...rest } = dto;
    const newStatus = status ?? post.status;
    const newScheduledAt = scheduledAt ? new Date(scheduledAt) : post.scheduledAt;

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...rest,
        status: newStatus,
        scheduledAt: newScheduledAt,
      },
      include: { mediaFiles: { orderBy: { order: 'asc' } } },
    });

    // Re-link media files if provided
    if (mediaFileIds?.length) {
      // Unlink old media files
      await this.prisma.mediaFile.updateMany({
        where: { postId: postId },
        data: { postId: null },
      });
      // Link new media files
      await this.prisma.mediaFile.updateMany({
        where: { id: { in: mediaFileIds } },
        data: { postId: postId },
      });
    }

    // Reschedule job if it was or is being scheduled
    await this.removePublishJob(postId);
    if (newStatus === PostStatus.SCHEDULED && newScheduledAt) {
      await this.schedulePublishJob(postId, newScheduledAt);
    }

    return updated;
  }

  async remove(userId: string, postId: string) {
    const post = await this.findOne(userId, postId);

    if (post.status === PostStatus.PUBLISHED) {
      throw new ForbiddenException('Cannot delete a published post');
    }

    await this.removePublishJob(postId);

    await this.prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { success: true, message: 'Post deleted' };
  }

  async duplicate(userId: string, postId: string) {
    const post = await this.findOne(userId, postId);

    const duplicated = await this.prisma.post.create({
      data: {
        userId,
        instagramAccountId: post.instagramAccountId,
        caption: post.caption ? `${post.caption} (copy)` : null,
        hashtags: post.hashtags,
        location: post.location,
        firstComment: post.firstComment,
        timezone: post.timezone,
        type: post.type,
        status: PostStatus.DRAFT,
        mediaFiles: {
          // Create new MediaFile records pointing to same URLs (cheap copy)
          create: post.mediaFiles.map((m) => ({
            url: m.url,
            s3Key: m.s3Key,
            mimeType: m.mimeType,
            sizeBytes: m.sizeBytes,
            order: m.order,
          })),
        },
      },
      include: { mediaFiles: { orderBy: { order: 'asc' } } },
    });

    return duplicated;
  }
}
