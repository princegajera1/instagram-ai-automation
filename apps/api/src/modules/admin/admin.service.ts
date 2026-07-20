import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('post-publish-queue') private readonly publishQueue: Queue,
    @InjectQueue('post-warning-queue') private readonly warningQueue: Queue,
  ) {}

  // ─── 1. List Users (Paginated & Searchable) ──────────────────────────────
  async getUsers(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          isActive: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  // ─── Toggle User Activation ──────────────────────────────────────────────
  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });
    if (!user) throw new Error('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  // ─── 2. Platform Overview Metrics ────────────────────────────────────────
  async getOverviewStats() {
    const [totalUsers, totalPosts, postsPublished, totalAIRequests] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.aIRequest.count({ where: { status: 'SUCCESS' } }),
    ]);

    return { totalUsers, totalPosts, postsPublished, totalAIRequests };
  }

  // ─── 3. Recent Audit Logs ────────────────────────────────────────────────
  async getAuditLogs(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { email: true } } },
    });
  }

  // ─── 4. System Health Status (DB, Redis, BullMQ Queue depths) ───────────
  async getSystemHealth() {
    let dbStatus = 'HEALTHY';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'UNHEALTHY';
    }

    let redisStatus = 'HEALTHY';
    let publishQueueDepth = 0;
    let warningQueueDepth = 0;

    try {
      publishQueueDepth = await this.publishQueue.getWaitingCount();
      warningQueueDepth = await this.warningQueue.getWaitingCount();
    } catch {
      redisStatus = 'UNHEALTHY';
    }

    return {
      status: dbStatus === 'HEALTHY' && redisStatus === 'HEALTHY' ? 'OK' : 'DEGRADED',
      database: dbStatus,
      redis: redisStatus,
      queues: {
        publishQueueWaiting: publishQueueDepth,
        warningQueueWaiting: warningQueueDepth,
      },
    };
  }

  // ─── 5. OpenAI API Token Usage & Breakdown ────────────────────────────────
  async getApiUsage() {
    const usageData = await this.prisma.aIRequest.groupBy({
      by: ['action'],
      _sum: { tokenCount: true, cost: true },
      _count: { id: true },
      where: { status: 'SUCCESS' },
    });

    const userBreakdown = await this.prisma.aIRequest.groupBy({
      by: ['userId'],
      _sum: { tokenCount: true, cost: true },
      _count: { id: true },
      where: { status: 'SUCCESS' },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Resolve user details for top list
    const topUsers = await Promise.all(
      userBreakdown.map(async (ub) => {
        const user = await this.prisma.user.findUnique({
          where: { id: ub.userId },
          select: { email: true, name: true },
        });
        return {
          userId: ub.userId,
          email: user?.email || 'unknown',
          name: user?.name || 'Anonymous',
          requestsCount: ub._count.id,
          tokensUsed: ub._sum.tokenCount || 0,
          estimatedCost: ub._sum.cost || 0,
        };
      }),
    );

    return {
      actionsBreakdown: usageData.map((d) => ({
        action: d.action,
        count: d._count.id,
        tokens: d._sum.tokenCount || 0,
        cost: d._sum.cost || 0,
      })),
      topUsers,
    };
  }
}
