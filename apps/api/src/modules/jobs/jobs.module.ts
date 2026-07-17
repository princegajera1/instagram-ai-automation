import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TokenRefreshProcessor } from './token-refresh.processor';
import { TokenRefreshSchedulerService } from './token-refresh-scheduler.service';
import { InstagramTokenRefreshService } from '../../services/instagram-token-refresh.service';
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
  connection = {
    host: 'localhost',
    port: 6379,
  };
}

@Module({
  imports: [
    BullModule.forRoot({
      connection,
    }),
    BullModule.registerQueue({
      name: 'token-refresh',
    }),
  ],
  providers: [
    TokenRefreshProcessor,
    TokenRefreshSchedulerService,
    InstagramTokenRefreshService,
    PrismaService,
  ],
  exports: [BullModule],
})
export class JobsModule {}
