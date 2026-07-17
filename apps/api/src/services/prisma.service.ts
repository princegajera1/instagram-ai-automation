import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connection successfully established via Prisma');
    } catch (err: any) {
      this.logger.error(`Database connection failed: ${err.message}. Backend will continue to run, but DB queries will fail.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
