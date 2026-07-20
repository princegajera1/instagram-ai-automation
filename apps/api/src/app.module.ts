import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SanitizationMiddleware } from './middlewares/sanitization.middleware';
import { InstagramAuthModule } from './modules/instagram-auth/instagram-auth.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { InstagramPublishModule } from './modules/instagram-publish/instagram-publish.module';
import { MediaUploadModule } from './modules/media-upload/media-upload.module';
import { PostsModule } from './modules/posts/posts.module';
import { AiContentModule } from './modules/ai-content/ai-content.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    InstagramAuthModule,
    JobsModule,
    InstagramPublishModule,
    MediaUploadModule,
    PostsModule,
    AiContentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SanitizationMiddleware).forRoutes('*');
  }
}
