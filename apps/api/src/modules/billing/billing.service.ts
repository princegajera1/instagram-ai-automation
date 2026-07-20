import { Injectable, Logger, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import Stripe from 'stripe';
import { Request } from 'express';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock_stripe_key', {
      apiVersion: '2025-01-27' as any, // Stable API version
    });
  }

  async createCheckoutSession(userId: string, plan: string): Promise<{ url: string | null }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Map plans to simple price items or custom pricing
    const planPrices: Record<string, { amount: number; name: string }> = {
      STARTER: { amount: 900, name: 'Starter Plan (InstaAI)' },
      PRO: { amount: 2900, name: 'Pro Plan (InstaAI)' },
      BUSINESS: { amount: 7900, name: 'Business Plan (InstaAI)' },
      ENTERPRISE: { amount: 19900, name: 'Enterprise Plan (InstaAI)' },
    };

    const targetPrice = planPrices[plan.toUpperCase()];
    if (!targetPrice) {
      throw new BadRequestException(`Invalid subscription plan: ${plan}`);
    }

    const frontendUrl = process.env.FRONTEND_SETTINGS_URL
      ? process.env.FRONTEND_SETTINGS_URL.replace('/settings', '')
      : 'http://localhost:3000';

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: targetPrice.name,
              description: `Monthly subscription to ${plan.toUpperCase()} tier`,
            },
            unit_amount: targetPrice.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/subscription?cancelled=true`,
      metadata: { userId, plan: plan.toUpperCase() },
    });

    return { url: session.url };
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeCustomerId) {
      throw new BadRequestException('No billing account found. Upgrade to a plan first.');
    }

    const frontendUrl = process.env.FRONTEND_SETTINGS_URL
      ? process.env.FRONTEND_SETTINGS_URL.replace('/settings', '')
      : 'http://localhost:3000';

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${frontendUrl}/billing`,
    });

    return { url: session.url };
  }

  async handleWebhook(req: RawBodyRequest<Request>): Promise<void> {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = this.stripe.webhooks.constructEvent(
          req.rawBody!,
          signature as string,
          webhookSecret,
        );
      } catch (err: any) {
        this.logger.error(`Webhook signature verification failed: ${err.message}`);
        throw new BadRequestException(`Webhook Error: ${err.message}`);
      }
    } else {
      // In development fallback without signature check (e.g. testing local webhook payload directly)
      this.logger.warn(
        'STRIPE_WEBHOOK_SECRET is missing or signature not provided. Processing raw body directly (dev mode).',
      );
      event = req.body;
    }

    this.logger.log(`Received Stripe Webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        if (userId && plan) {
          await this.prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan: plan,
              subscriptionStatus: 'ACTIVE',
            },
          });
          this.logger.log(`Stripe Upgrade: User ${userId} upgraded to ${plan}`);
          // Send system notification
          await this.prisma.notification.create({
            data: {
              userId,
              title: 'Plan Upgraded! 🎉',
              message: `Thank you for subscribing! Your account is now active on the ${plan} plan.`,
              type: 'BILLING',
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const status = sub.status === 'active' ? 'ACTIVE' : 'PAST_DUE';

        const user = await this.prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { subscriptionStatus: status },
          });
          this.logger.log(`Subscription Updated: User ${user.id} status is now ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const user = await this.prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionPlan: 'FREE',
              subscriptionStatus: 'CANCELED',
            },
          });
          this.logger.log(`Subscription Deleted: User ${user.id} downgraded to FREE`);
          // Send notification
          await this.prisma.notification.create({
            data: {
              userId: user.id,
              title: 'Subscription Cancelled',
              message:
                'Your premium subscription has ended. Your account has been reverted to the Free plan limits.',
              type: 'BILLING',
            },
          });
        }
        break;
      }
    }
  }

  // Helper for checking user limits
  async getUserUsage(userId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            connectedAccounts: true,
            posts: {
              where: {
                createdAt: { gte: startOfMonth },
                status: { in: ['SCHEDULED', 'PUBLISHED'] },
              },
            },
            aiRequests: {
              where: {
                createdAt: { gte: startOfMonth },
                status: 'SUCCESS',
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      plan: user.subscriptionPlan || 'FREE',
      status: user.subscriptionStatus || 'ACTIVE',
      usage: {
        connectedAccounts: user._count.connectedAccounts,
        scheduledPostsThisMonth: user._count.posts,
        aiRequestsThisMonth: user._count.aiRequests,
      },
    };
  }
}
