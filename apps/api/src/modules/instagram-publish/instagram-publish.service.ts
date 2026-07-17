import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { decrypt } from '../../common/utils/crypto.util';
import { PostStatus, NotificationType } from '@prisma/client';

@Injectable()
export class InstagramPublishService {
  private readonly logger = new Logger(InstagramPublishService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getAccountTokenAndUserId(
    instagramAccountId: string,
  ): Promise<{ token: string; igUserId: string; userId: string }> {
    const igAccount = await this.prisma.instagramAccount.findUnique({
      where: { id: instagramAccountId },
      include: { connectedAccount: true },
    });

    if (!igAccount || !igAccount.connectedAccount) {
      throw new BadRequestException('Instagram Account or linked Connected Account not found');
    }

    const token = decrypt(igAccount.connectedAccount.accessToken);
    return {
      token,
      igUserId: igAccount.connectedAccount.platformAccountId, // The Instagram Business Account ID
      userId: igAccount.connectedAccount.userId,
    };
  }

  async createMediaContainer(
    instagramAccountId: string,
    mediaUrl: string,
    caption: string,
    mediaType: 'IMAGE' | 'VIDEO' | 'REEL',
    isCarouselItem = false,
  ): Promise<string> {
    const { token, igUserId } = await this.getAccountTokenAndUserId(instagramAccountId);

    let createContainerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media?access_token=${token}`;

    if (mediaType === 'IMAGE') {
      createContainerUrl += `&image_url=${encodeURIComponent(mediaUrl)}`;
      if (isCarouselItem) {
        createContainerUrl += `&is_carousel_item=true`;
      } else if (caption) {
        createContainerUrl += `&caption=${encodeURIComponent(caption)}`;
      }
    } else if (mediaType === 'VIDEO') {
      createContainerUrl += `&media_type=VIDEO&video_url=${encodeURIComponent(mediaUrl)}`;
      if (isCarouselItem) {
        createContainerUrl += `&is_carousel_item=true`;
      } else if (caption) {
        createContainerUrl += `&caption=${encodeURIComponent(caption)}`;
      }
    } else if (mediaType === 'REEL') {
      createContainerUrl += `&media_type=REELS&video_url=${encodeURIComponent(mediaUrl)}&share_to_feed=true`;
      if (caption) {
        createContainerUrl += `&caption=${encodeURIComponent(caption)}`;
      }
    }

    this.logger.log(`Creating container of type ${mediaType} for Instagram ID ${igUserId}`);

    const res = await fetch(createContainerUrl, { method: 'POST' });
    const data = await res.json();

    if (data.error) {
      this.logger.error(`Failed to create Instagram media container:`, data.error);
      throw new BadRequestException(
        data.error.message || 'Instagram media container creation failed',
      );
    }

    return data.id; // Returns container ID
  }

  async createCarouselContainer(
    instagramAccountId: string,
    childrenContainerIds: string[],
    caption: string,
  ): Promise<string> {
    const { token, igUserId } = await this.getAccountTokenAndUserId(instagramAccountId);

    const childrenStr = childrenContainerIds.join(',');
    let createContainerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media?media_type=CAROUSEL&children=${encodeURIComponent(
      childrenStr,
    )}&access_token=${token}`;

    if (caption) {
      createContainerUrl += `&caption=${encodeURIComponent(caption)}`;
    }

    this.logger.log(
      `Creating carousel container for Instagram ID ${igUserId} with children: ${childrenStr}`,
    );

    const res = await fetch(createContainerUrl, { method: 'POST' });
    const data = await res.json();

    if (data.error) {
      this.logger.error(`Failed to create carousel container:`, data.error);
      throw new BadRequestException(data.error.message || 'Carousel container creation failed');
    }

    return data.id; // Returns parent container ID
  }

  async pollContainerStatus(instagramAccountId: string, containerId: string): Promise<boolean> {
    const { token } = await this.getAccountTokenAndUserId(instagramAccountId);
    const statusUrl = `https://graph.facebook.com/v19.0/${containerId}?fields=status_code,status,error_message&access_token=${token}`;

    const maxWaitMs = 5 * 60 * 1000; // 5 minutes max timeout
    const start = Date.now();
    let delay = 2000; // start at 2s delay

    while (Date.now() - start < maxWaitMs) {
      this.logger.log(
        `Polling container ${containerId} status (elapsed: ${Math.round((Date.now() - start) / 1000)}s)...`,
      );

      const res = await fetch(statusUrl);
      const data = await res.json();

      if (data.error) {
        this.logger.error(`Error polling container status:`, data.error);
        throw new BadRequestException(data.error.message || 'Failed checking media status');
      }

      const statusCode = data.status_code;

      if (statusCode === 'FINISHED') {
        this.logger.log(`Container ${containerId} compilation FINISHED.`);
        return true;
      }

      if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
        const errorDetail = data.error_message || 'Video processing failed on Meta side';
        this.logger.error(
          `Container ${containerId} compilation failed with code ${statusCode}: ${errorDetail}`,
        );
        throw new BadRequestException(errorDetail);
      }

      // Wait with backoff (capped at 30s)
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 30000);
    }

    throw new BadRequestException('Timed out waiting for Instagram video container processing');
  }

  async publishContainer(instagramAccountId: string, containerId: string): Promise<string> {
    const { token, igUserId } = await this.getAccountTokenAndUserId(instagramAccountId);

    const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${containerId}&access_token=${token}`;

    this.logger.log(`Publishing container ${containerId} to Instagram ID ${igUserId}`);

    const res = await fetch(publishUrl, { method: 'POST' });
    const data = await res.json();

    if (data.error) {
      this.logger.error(`Failed to publish container:`, data.error);
      throw new BadRequestException(data.error.message || 'Instagram media publication failed');
    }

    return data.id; // Returns the published Instagram Media ID
  }

  async publishPost(postId: string): Promise<string> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        mediaFiles: {
          orderBy: { order: 'asc' },
        },
        instagramAccount: true,
      },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    const { userId } = await this.getAccountTokenAndUserId(post.instagramAccountId);

    try {
      this.logger.log(`Starting publication flow for Post ${postId}`);
      let instagramMediaId = '';

      if (post.mediaFiles.length === 0) {
        throw new BadRequestException('Post has no media files attached');
      }

      const caption = post.caption || '';

      if (post.type === 'CAROUSEL' && post.mediaFiles.length > 1) {
        // Carousel Container Flow
        const childContainerIds: string[] = [];
        for (const file of post.mediaFiles) {
          const fileType = file.mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE';
          const childId = await this.createMediaContainer(
            post.instagramAccountId,
            file.url,
            '', // Carousel items don't have captions individually
            fileType,
            true, // isCarouselItem
          );

          // Poll immediately if it is a video carousel item
          if (fileType === 'VIDEO') {
            await this.pollContainerStatus(post.instagramAccountId, childId);
          }
          childContainerIds.push(childId);
        }

        // Create Parent Carousel Container
        const parentId = await this.createCarouselContainer(
          post.instagramAccountId,
          childContainerIds,
          caption,
        );

        // Poll parent container
        await this.pollContainerStatus(post.instagramAccountId, parentId);

        // Publish Carousel
        instagramMediaId = await this.publishContainer(post.instagramAccountId, parentId);
      } else {
        // Single Image/Video/Reel Flow
        const file = post.mediaFiles[0];
        let calculatedType: 'IMAGE' | 'VIDEO' | 'REEL' = 'IMAGE';

        if (post.type === 'REEL') {
          calculatedType = 'REEL';
        } else if (file.mimeType.startsWith('video/')) {
          calculatedType = 'VIDEO';
        }

        // Create Container
        const containerId = await this.createMediaContainer(
          post.instagramAccountId,
          file.url,
          caption,
          calculatedType,
        );

        // Poll status if video/reel
        if (calculatedType === 'VIDEO' || calculatedType === 'REEL') {
          await this.pollContainerStatus(post.instagramAccountId, containerId);
        }

        // Publish Container
        instagramMediaId = await this.publishContainer(post.instagramAccountId, containerId);
      }

      // Update Post as Published
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
          instagramMediaId,
        },
      });

      // Create Success Notification
      await this.prisma.notification.create({
        data: {
          userId,
          title: 'Post Published Successfully',
          message: `Your scheduled post was successfully published to Instagram! View it here: https://instagram.com/p/${instagramMediaId}`,
          type: NotificationType.POST_PUBLISHED,
        },
      });

      this.logger.log(
        `Post ${postId} published successfully! Instagram Media ID: ${instagramMediaId}`,
      );
      return instagramMediaId;
    } catch (err: any) {
      this.logger.error(`Publishing post ${postId} failed: ${err.message}`);

      // Update Post as Failed
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.FAILED,
          failureReason: err.message || 'Publication failed',
        },
      });

      // Create Failed Notification
      await this.prisma.notification.create({
        data: {
          userId,
          title: 'Post Publication Failed',
          message: `We failed to publish your post to Instagram. Reason: ${err.message || 'Unknown error'}`,
          type: NotificationType.POST_FAILED,
        },
      });

      throw new BadRequestException(err.message || 'Publication failed');
    }
  }
}
