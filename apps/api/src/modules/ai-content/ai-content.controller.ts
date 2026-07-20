import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { AiCaptionService } from './ai-caption.service';
import { BestTimeService } from './best-time-predictor.service';
import { ContentCalendarService } from './content-calendar.service';
import {
  GenerateCaptionDto,
  RewriteCaptionDto,
  GenerateHashtagsDto,
  EmojiSuggestDto,
  CtaSuggestDto,
  SeoCaptionDto,
  EngagementScoreDto,
  GenerateCalendarDto,
  TrendingIdeasDto,
} from './dto/ai-content.dto';

/** Extract userId safely regardless of which property the guard attaches it to */
function getUserId(req: any): string {
  return req.user?.id || req.user?.sub || req.user?.userId || 'anonymous';
}

@Controller('api/ai')
@UseGuards(ClerkAuthGuard)
export class AiContentController {
  constructor(
    private readonly captionService: AiCaptionService,
    private readonly bestTimeService: BestTimeService,
    private readonly calendarService: ContentCalendarService,
  ) {}

  // ── Caption endpoints ──────────────────────────────────────────────────────

  @Post('caption/generate')
  generateCaption(@Req() req: any, @Body() dto: GenerateCaptionDto) {
    return this.captionService.generateCaption(getUserId(req), dto);
  }

  @Post('caption/rewrite')
  rewriteCaption(@Req() req: any, @Body() dto: RewriteCaptionDto) {
    return this.captionService.rewriteCaption(getUserId(req), dto);
  }

  // ── Hashtag endpoint ───────────────────────────────────────────────────────

  @Post('hashtags/generate')
  generateHashtags(@Req() req: any, @Body() dto: GenerateHashtagsDto) {
    return this.captionService.generateHashtags(getUserId(req), dto);
  }

  // ── Utility endpoints ──────────────────────────────────────────────────────

  @Post('emoji-suggest')
  suggestEmojis(@Req() req: any, @Body() dto: EmojiSuggestDto) {
    return this.captionService.suggestEmojis(getUserId(req), dto);
  }

  @Post('cta-suggest')
  suggestCta(@Req() req: any, @Body() dto: CtaSuggestDto) {
    return this.captionService.suggestCta(getUserId(req), dto);
  }

  @Post('seo-caption')
  generateSeoCaption(@Req() req: any, @Body() dto: SeoCaptionDto) {
    return this.captionService.generateSeoCaption(getUserId(req), dto);
  }

  @Post('engagement-score')
  scoreEngagement(@Req() req: any, @Body() dto: EngagementScoreDto) {
    return this.captionService.scoreEngagement(getUserId(req), dto);
  }

  // ── Best time endpoint ─────────────────────────────────────────────────────

  @Get('best-time')
  getBestTime(@Query('instagramAccountId') instagramAccountId: string) {
    return this.bestTimeService.getBestTimes(instagramAccountId);
  }

  // ── AI Calendar endpoints ─────────────────────────────────────────────────

  @Post('calendar/generate')
  generateCalendar(@Req() req: any, @Body() dto: GenerateCalendarDto) {
    return this.calendarService.generateCalendar(getUserId(req), dto);
  }

  @Post('trending-ideas')
  getTrendingIdeas(@Req() req: any, @Body() dto: TrendingIdeasDto) {
    return this.calendarService.getTrendingIdeas(getUserId(req), dto);
  }

  // ── Usage stats ────────────────────────────────────────────────────────────

  @Get('usage')
  getUsage(@Req() req: any) {
    return this.captionService.getUsageStats(getUserId(req));
  }
}
