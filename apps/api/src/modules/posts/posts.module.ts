import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostPublishProcessor } from './post-publish.processor';
import { PostWarningProcessor } from './post-warning.processor';
import { PostWarningSchedulerService } from './post-warning-scheduler.service';
import { InstagramPublishService } from '../instagram-publish/instagram-publish.service';
import { PrismaService } from '../../services/prisma.service';

const redisUrlString = process.env.REDIS_URL || 'redis://localhost:6379';
let connection: any;
try {
  const parsed = new URL(redisUrlString);
  connection = {
    host: parsed.hostname || 'localhost',
    port: parseInt(parsed.port, 10) || 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
  };
} catch {
  connection = { host: 'localhost', port: 6379 };
}

@Module({
  imports: [
    BullModule.forRoot({ connection }),
    BullModule.registerQueue({ name: 'post-publish-queue' }),
    BullModule.registerQueue({ name: 'post-warning-queue' }),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostPublishProcessor,
    PostWarningProcessor,
    PostWarningSchedulerService,
    InstagramPublishService,
    PrismaService,
  ],
  exports: [PostsService],
})
export class PostsModule {}
