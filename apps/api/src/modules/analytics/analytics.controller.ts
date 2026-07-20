import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { AnalyticsService } from './analytics.service';

function getUserId(req: any): string {
  return req.user?.id || req.user?.sub || req.user?.userId || 'anonymous';
}

@Controller('api/analytics')
@UseGuards(ClerkAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@Query('instagramAccountId') instagramAccountId: string) {
    return this.analyticsService.getOverview(instagramAccountId);
  }

  @Get('posts/top')
  getTopPosts(@Query('instagramAccountId') instagramAccountId: string) {
    return this.analyticsService.getTopPosts(instagramAccountId);
  }

  @Get('growth')
  getGrowth(@Query('instagramAccountId') instagramAccountId: string) {
    return this.analyticsService.getGrowth(instagramAccountId);
  }

  @Get('hashtags/top')
  getTopHashtags(@Req() req: any) {
    return this.analyticsService.getTopHashtags(getUserId(req));
  }
}
