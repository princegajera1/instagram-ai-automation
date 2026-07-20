import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { Response } from 'express';

@Controller('api/health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async checkHealth(@Res() res: Response) {
    let dbStatus = 'UP';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbStatus = 'DOWN';
    }

    const healthStatus = {
      status: dbStatus === 'UP' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      details: {
        database: dbStatus,
      },
    };

    if (dbStatus === 'UP') {
      return res.status(HttpStatus.OK).json(healthStatus);
    } else {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(healthStatus);
    }
  }
}
