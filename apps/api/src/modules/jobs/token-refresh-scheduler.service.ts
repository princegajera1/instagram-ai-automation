import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TokenRefreshSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TokenRefreshSchedulerService.name);

  constructor(@InjectQueue('token-refresh') private readonly refreshQueue: Queue) {}

  async onApplicationBootstrap() {
    try {
      // Remove existing daily jobs if any, to avoid duplicate repeatable schedulers
      const repeatableJobs = await this.refreshQueue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        if (job.name === 'daily-refresh') {
          await this.refreshQueue.removeRepeatableByKey(job.key);
        }
      }

      // Schedule repeatable daily token refresh job (runs daily at midnight)
      await this.refreshQueue.add(
        'daily-refresh',
        {},
        {
          repeat: {
            pattern: '0 0 * * *',
          },
        },
      );
      this.logger.log('Successfully scheduled daily token refresh BullMQ job');
    } catch (err: any) {
      this.logger.error(`Failed to schedule token refresh job: ${err.message}`);
    }
  }
}
