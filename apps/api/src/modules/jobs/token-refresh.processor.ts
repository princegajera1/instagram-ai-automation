import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InstagramTokenRefreshService } from '../../services/instagram-token-refresh.service';

@Processor('token-refresh')
export class TokenRefreshProcessor extends WorkerHost {
  private readonly logger = new Logger(TokenRefreshProcessor.name);

  constructor(private readonly refreshService: InstagramTokenRefreshService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'daily-refresh') {
      const results = await this.refreshService.refreshExpiringTokens();
      this.logger.log(
        `Daily token refresh complete: Checked ${results.totalChecked}, Refreshed ${results.refreshed}, Failed ${results.failed}`,
      );
      return results;
    }
  }
}
