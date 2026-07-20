import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

export interface TimeWindow {
  day: string;
  times: string[];
  reason: string;
}

export interface BestTimeResult {
  windows: TimeWindow[];
  isPersonalized: boolean;
  note: string;
}

// Industry best-practice posting windows (fallback when no account analytics exist)
// Sources: Later, HubSpot, Sprout Social meta-analyses — used only as fallback defaults
const INDUSTRY_DEFAULTS: TimeWindow[] = [
  {
    day: 'Monday',
    times: ['06:00', '12:00', '19:00'],
    reason: 'Start-of-week motivation content peaks early morning and lunch',
  },
  {
    day: 'Tuesday',
    times: ['09:00', '12:00', '18:00'],
    reason: 'Tuesday shows consistently high engagement across niches',
  },
  {
    day: 'Wednesday',
    times: ['11:00', '14:00', '19:00'],
    reason: 'Midweek audiences are most active at lunch and early evening',
  },
  {
    day: 'Thursday',
    times: ['12:00', '19:00'],
    reason: 'Pre-weekend enthusiasm drives strong Thursday evening engagement',
  },
  {
    day: 'Friday',
    times: ['12:00', '17:00'],
    reason: 'End-of-week browsing spikes at lunch and early commute',
  },
  {
    day: 'Saturday',
    times: ['09:00', '11:00'],
    reason: 'Weekend leisure browsing peaks mid-morning',
  },
  {
    day: 'Sunday',
    times: ['10:00', '19:00'],
    reason: 'Sunday planning content peaks late morning and early evening',
  },
];

@Injectable()
export class BestTimeService {
  private readonly logger = new Logger(BestTimeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBestTimes(instagramAccountId: string): Promise<BestTimeResult> {
    // Attempt to find Analytics records for personalized recommendations
    const analytics = await this.prisma.analytics.findMany({
      where: { instagramAccountId },
      include: { post: { select: { scheduledAt: true, publishedAt: true } } },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });

    // Need at least 10 posts with engagement data for personalized recommendations
    const validRecords = analytics.filter(
      (a) => a.engagementRate > 0 && (a.post?.publishedAt || a.post?.scheduledAt),
    );

    if (validRecords.length < 10) {
      this.logger.log(
        `Insufficient analytics for account ${instagramAccountId} (${validRecords.length} records). Returning industry defaults.`,
      );
      return {
        windows: INDUSTRY_DEFAULTS,
        isPersonalized: false,
        note: `Not enough historical data (found ${validRecords.length} posts with engagement data; need at least 10). Showing industry best-practice windows instead. Post consistently to build personalized data.`,
      };
    }

    // Build engagement-weighted time analysis
    const dayHourMap: Record<
      string,
      Record<number, { totalEngagement: number; count: number }>
    > = {};

    for (const record of validRecords) {
      const postTime = record.post?.publishedAt ?? record.post?.scheduledAt;
      if (!postTime) continue;

      const date = new Date(postTime);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      if (!dayHourMap[day]) dayHourMap[day] = {};
      if (!dayHourMap[day][hour]) dayHourMap[day][hour] = { totalEngagement: 0, count: 0 };

      dayHourMap[day][hour].totalEngagement += record.engagementRate;
      dayHourMap[day][hour].count++;
    }

    const personalizedWindows: TimeWindow[] = [];

    for (const [day, hours] of Object.entries(dayHourMap)) {
      const sorted = Object.entries(hours)
        .map(([h, data]) => ({
          hour: parseInt(h),
          avgEngagement: data.totalEngagement / data.count,
        }))
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 3);

      if (sorted.length > 0) {
        personalizedWindows.push({
          day,
          times: sorted.map((s) => `${String(s.hour).padStart(2, '0')}:00`),
          reason: `Based on your ${validRecords.length} published posts — avg engagement rate ${(
            sorted[0].avgEngagement * 100
          ).toFixed(1)}% at this time`,
        });
      }
    }

    return {
      windows: personalizedWindows.length > 0 ? personalizedWindows : INDUSTRY_DEFAULTS,
      isPersonalized: personalizedWindows.length > 0,
      note:
        personalizedWindows.length > 0
          ? `Personalized based on ${validRecords.length} posts with engagement data from your account.`
          : 'Could not derive personalized windows from analytics. Showing industry defaults.',
    };
  }
}
