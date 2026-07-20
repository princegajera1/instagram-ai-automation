import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { BillingService } from './billing.service';
import { Request } from 'express';

function getUserId(req: any): string {
  return req.user?.id || req.user?.sub || req.user?.userId || 'anonymous';
}

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('create-checkout-session')
  @UseGuards(ClerkAuthGuard)
  createCheckoutSession(@Req() req: any, @Body('plan') plan: string) {
    return this.billingService.createCheckoutSession(getUserId(req), plan);
  }

  @Post('create-portal-session')
  @UseGuards(ClerkAuthGuard)
  createPortalSession(@Req() req: any) {
    return this.billingService.createPortalSession(getUserId(req));
  }

  @Get('usage')
  @UseGuards(ClerkAuthGuard)
  getUserUsage(@Req() req: any) {
    return this.billingService.getUserUsage(getUserId(req));
  }

  // Webhook endpoint: Stripe sends POST requests here.
  // Note: Needs to bypass Auth guards.
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    await this.billingService.handleWebhook(req);
    return { received: true };
  }
}
