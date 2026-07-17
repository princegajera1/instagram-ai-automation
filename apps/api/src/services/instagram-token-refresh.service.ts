import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { encrypt, decrypt } from '../common/utils/crypto.util';
import { AccountStatus, NotificationType } from '@prisma/client';

@Injectable()
export class InstagramTokenRefreshService {
  private readonly logger = new Logger(InstagramTokenRefreshService.name);

  private readonly appId = process.env.META_APP_ID;
  private readonly appSecret = process.env.META_APP_SECRET;

  constructor(private readonly prisma: PrismaService) {}

  async refreshConnectedAccountToken(accountId: string): Promise<boolean> {
    if (!this.appId || !this.appSecret) {
      this.logger.error('Meta App credentials are not configured for token refresh');
      return false;
    }

    const account = await this.prisma.connectedAccount.findUnique({
      where: { id: accountId },
      include: { instagramAccount: true },
    });

    if (!account) {
      this.logger.error(`ConnectedAccount not found: ${accountId}`);
      return false;
    }

    try {
      // 1. Decrypt existing long-lived token
      const existingToken = decrypt(account.accessToken);

      // 2. Query Meta to exchange for a new long-lived token
      const refreshUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${existingToken}`;

      const res = await fetch(refreshUrl);
      const data = await res.json();

      if (data.error) {
        this.logger.error(
          `Meta token refresh error response for account ${accountId}:`,
          data.error,
        );
        throw new Error(data.error.message || 'Token refresh rejected by Meta');
      }

      const newToken = data.access_token;
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days fallback

      // 3. Encrypt new token and save in database
      const encryptedToken = encrypt(newToken);
      await this.prisma.connectedAccount.update({
        where: { id: accountId },
        data: {
          accessToken: encryptedToken,
          expiresAt,
          status: AccountStatus.ACTIVE,
        },
      });

      this.logger.log(`Successfully refreshed token for connected account ${accountId}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to refresh token for account ${accountId}: ${err.message}`);

      // Update status to TOKEN_EXPIRED
      await this.prisma.connectedAccount.update({
        where: { id: accountId },
        data: { status: AccountStatus.TOKEN_EXPIRED },
      });

      // Create notification for the user
      const accountName = account.instagramAccount?.username || account.platformAccountId;
      await this.prisma.notification.create({
        data: {
          userId: account.userId,
          title: 'Instagram Connection Expired',
          message: `Your linked Instagram account (@${accountName}) session has expired. Please go to Settings and reconnect your account.`,
          type: NotificationType.POST_FAILED,
        },
      });

      return false;
    }
  }

  async refreshExpiringTokens(): Promise<{
    totalChecked: number;
    refreshed: number;
    failed: number;
  }> {
    // Fetch accounts expiring in the next 7 days (or already expired)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const accountsToRefresh = await this.prisma.connectedAccount.findMany({
      where: {
        expiresAt: {
          lte: sevenDaysFromNow,
        },
        status: AccountStatus.ACTIVE,
      },
    });

    this.logger.log(`Found ${accountsToRefresh.length} accounts with tokens expiring soon`);

    let refreshedCount = 0;
    let failedCount = 0;

    for (const account of accountsToRefresh) {
      const success = await this.refreshConnectedAccountToken(account.id);
      if (success) {
        refreshedCount++;
      } else {
        failedCount++;
      }
    }

    return {
      totalChecked: accountsToRefresh.length,
      refreshed: refreshedCount,
      failed: failedCount,
    };
  }
}
