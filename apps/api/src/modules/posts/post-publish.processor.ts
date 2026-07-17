import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InstagramPublishService } from '../instagram-publish/instagram-publish.service';

@Processor('post-publish-queue')
export class PostPublishProcessor extends WorkerHost {
  private readonly logger = new Logger(PostPublishProcessor.name);

  constructor(private readonly publishService: InstagramPublishService) {
    super();
  }

  async process(job: Job<{ postId: string }>): Promise<any> {
    this.logger.log(`Processing publish job for post ${job.data.postId}`);
    try {
      const mediaId = await this.publishService.publishPost(job.data.postId);
      this.logger.log(`Post ${job.data.postId} published successfully! Instagram Media ID: ${mediaId}`);
      return { success: true, mediaId };
    } catch (err: any) {
      this.logger.error(`Failed to publish post ${job.data.postId}: ${err.message}`);
      throw err;
    }
  }
}
