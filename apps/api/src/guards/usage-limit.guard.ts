import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { PLAN_LIMITS } from '../modules/billing/plan-limits';

@Injectable()
export class UsageLimitGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?.sub || request.user?.userId;

    if (!userId) {
      // If endpoint doesn't have ClerkAuthGuard yet or user is bypass anonymous, allow
      return true;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, subscriptionStatus: true },
    });

    const plan = (user?.subscriptionPlan || 'FREE').toUpperCase();
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

    const path = request.route.path;

    // ─── 1. Check AI generation endpoints ─────────────────────────────────────
    if (path.includes('/api/ai/')) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const aiCount = await this.prisma.aIRequest.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
          status: 'SUCCESS',
        },
      });

      if (aiCount >= limits.maxAiRequestsPerMonth) {
        throw new HttpException(
          `AI Generation Limit Exceeded: Your ${plan} plan allows ${limits.maxAiRequestsPerMonth} AI generations/month. Please upgrade your plan under Settings to generate more.`,
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
    }

    // ─── 2. Check Post scheduling/creation endpoints ─────────────────────────
    if (path.includes('/api/posts') && request.method === 'POST') {
      // A. Check connected accounts count first
      const connectedCount = await this.prisma.connectedAccount.count({
        where: { userId },
      });

      if (connectedCount > limits.maxConnectedAccounts) {
        throw new HttpException(
          `Connected Accounts Limit Exceeded: Your ${plan} plan allows connecting up to ${limits.maxConnectedAccounts} account(s). Please upgrade to connect more.`,
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      // B. Check scheduled posts limit for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const postCount = await this.prisma.post.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
          status: { in: ['SCHEDULED', 'PUBLISHED'] },
        },
      });

      if (postCount >= limits.maxScheduledPostsPerMonth) {
        throw new HttpException(
          `Monthly Scheduled Posts Limit Exceeded: Your ${plan} plan allows scheduling up to ${limits.maxScheduledPostsPerMonth} posts/month. Please upgrade to schedule more.`,
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
    }

    return true;
  }
}
