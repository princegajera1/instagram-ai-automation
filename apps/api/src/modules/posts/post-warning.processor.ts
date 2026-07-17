import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PostWarningSchedulerService } from './post-warning-scheduler.service';

@Processor('post-warning-queue')
export class PostWarningProcessor extends WorkerHost {
  private readonly logger = new Logger(PostWarningProcessor.name);

  constructor(private readonly warningService: PostWarningSchedulerService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Running upcoming post warning check (job: ${job.id})`);
    await this.warningService.checkAndNotify();
    return { success: true };
  }
}
