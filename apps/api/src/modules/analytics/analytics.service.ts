import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── 1. Get Overview Stats ────────────────────────────────────────────────
  async getOverview(instagramAccountId: string): Promise<any> {
    const igAccount = await this.prisma.instagramAccount.findUnique({
      where: { id: instagramAccountId },
      include: { connectedAccount: true },
    });

    if (!igAccount) {
      throw new BadRequestException('Instagram account not found');
    }

    // In a live production system, we would perform:
    // const res = await fetch(`https://graph.facebook.com/v19.0/${igAccount.connectedAccount.platformAccountId}/insights?...&access_token=${decryptedToken}`);
    //
    // For this scope, we return the stored db metrics and fall back gracefully if
    // no snapshots exist yet. If analytics snapshots exist, we aggregate the latest ones.
    const latestAnalytics = await this.prisma.analytics.findFirst({
      where: { instagramAccountId },
      orderBy: { recordedAt: 'desc' },
    });

    if (!latestAnalytics) {
      // Fallback response showing empty/initial state when account has no data yet
      return {
        followers: igAccount.followersCount || 0,
        reach: 0,
        impressions: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        engagementRate: 0.0,
        isFallback: true,
        note: 'No historic data collected yet. Publish posts to begin aggregation.',
      };
    }

    return {
      followers: igAccount.followersCount || 0,
      reach: latestAnalytics.reach,
      impressions: latestAnalytics.impressions,
      likes: latestAnalytics.likes,
      shares: latestAnalytics.shares,
      comments: latestAnalytics.comments,
      engagementRate: latestAnalytics.engagementRate,
      isFallback: false,
    };
  }

  // ─── 2. Top Performing Posts ──────────────────────────────────────────────
  async getTopPosts(instagramAccountId: string): Promise<any[]> {
    // Return posts ordered by engagement potential (likes + comments + shares)
    const posts = await this.prisma.post.findMany({
      where: { instagramAccountId, status: 'PUBLISHED', isDeleted: false },
      include: { analytics: { orderBy: { recordedAt: 'desc' }, take: 1 } },
      take: 5,
    });

    return posts
      .map((post) => {
        const latestStats = post.analytics[0];
        return {
          id: post.id,
          caption: post.caption || '',
          type: post.type,
          publishedAt: post.publishedAt,
          likes: latestStats?.likes ?? 0,
          comments: latestStats?.comments ?? 0,
          shares: latestStats?.shares ?? 0,
          engagementRate: latestStats?.engagementRate ?? 0,
        };
      })
      .sort((a, b) => b.likes + b.comments - (a.likes + a.comments));
  }

  // ─── 3. Growth Over Time ──────────────────────────────────────────────────
  async getGrowth(instagramAccountId: string): Promise<any[]> {
    // Pull the last 30 snapshots to show growth chart points
    const snapshots = await this.prisma.analytics.findMany({
      where: { instagramAccountId },
      orderBy: { recordedAt: 'asc' },
      take: 30,
    });

    return snapshots.map((s) => ({
      date: s.recordedAt.toISOString().split('T')[0],
      reach: s.reach,
      impressions: s.impressions,
      engagementRate: s.engagementRate,
    }));
  }

  // ─── 4. Top Hashtags from History ─────────────────────────────────────────
  async getTopHashtags(userId: string): Promise<any[]> {
    const posts = await this.prisma.post.findMany({
      where: { userId, isDeleted: false },
      select: { hashtags: true },
    });

    const hashtagCounts: Record<string, number> = {};

    for (const post of posts) {
      if (!post.hashtags) continue;
      const tags = post.hashtags.split(/\s+/).filter((t) => t.startsWith('#'));
      for (const tag of tags) {
        hashtagCounts[tag] = (hashtagCounts[tag] ?? 0) + 1;
      }
    }

    return Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}
