import { Module } from '@nestjs/common';
import { InstagramAuthController } from './instagram-auth.controller';
import { InstagramAuthService } from './instagram-auth.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
  controllers: [InstagramAuthController],
  providers: [InstagramAuthService, PrismaService],
  exports: [InstagramAuthService],
})
export class InstagramAuthModule {}
