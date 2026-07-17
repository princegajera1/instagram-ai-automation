import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { encrypt } from '../../common/utils/crypto.util';
import { Platform, AccountStatus } from '@prisma/client';

@Injectable()
export class InstagramAuthService {
  private readonly logger = new Logger(InstagramAuthService.name);

  private readonly appId = process.env.META_APP_ID;
  private readonly appSecret = process.env.META_APP_SECRET;
  private readonly redirectUri =
    process.env.META_REDIRECT_URI || 'http://localhost:4000/api/instagram/callback';

  constructor(private readonly prisma: PrismaService) {}

  getConnectUrl(userId: string): string {
    if (!this.appId) {
      throw new InternalServerErrorException('META_APP_ID is not configured');
    }

    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement',
    ].join(',');

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(
      this.redirectUri,
    )}&state=${userId}&scope=${scopes}`;
  }

  async handleCallback(code: string, userId: string) {
    if (!this.appId || !this.appSecret) {
      throw new InternalServerErrorException('Meta App credentials are not configured');
    }

    // 1. Exchange code for short-lived access token
    const tokenExchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${this.appId}&redirect_uri=${encodeURIComponent(
      this.redirectUri,
    )}&client_secret=${this.appSecret}&code=${code}`;

    let shortLivedToken: string;
    try {
      const res = await fetch(tokenExchangeUrl);
      const data = await res.json();
      if (data.error) {
        this.logger.error('Short-lived token exchange failed:', data.error);
        throw new BadRequestException(data.error.message || 'OAuth exchange failed');
      }
      shortLivedToken = data.access_token;
    } catch (err: any) {
      this.logger.error(`OAuth exchange request failed: ${err.message}`);
      throw new BadRequestException(err.message || 'Failed to exchange token');
    }

    // 2. Exchange short-lived token for long-lived access token
    const longLivedTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${shortLivedToken}`;

    let longLivedToken: string;
    let expiresAt: Date | null = null;

    try {
      const res = await fetch(longLivedTokenUrl);
      const data = await res.json();
      if (data.error) {
        this.logger.error('Long-lived token exchange failed:', data.error);
        throw new BadRequestException(data.error.message || 'Long-lived OAuth exchange failed');
      }
      longLivedToken = data.access_token;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000);
      } else {
        // Long-lived user access tokens usually expire in 60 days
        expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      }
    } catch (err: any) {
      this.logger.error(`Long-lived token exchange request failed: ${err.message}`);
      throw new BadRequestException(err.message || 'Failed to fetch long-lived token');
    }

    // 3. Fetch user's Facebook Pages
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedToken}`;
    let pages: any[] = [];
    try {
      const res = await fetch(pagesUrl);
      const data = await res.json();
      if (data.error) {
        this.logger.error('Failed to fetch Facebook Pages:', data.error);
        throw new BadRequestException(data.error.message || 'Failed to fetch Facebook Pages');
      }
      pages = data.data || [];
    } catch (err: any) {
      this.logger.error(`Pages fetch request failed: ${err.message}`);
      throw new BadRequestException(err.message || 'Failed to read Pages data');
    }

    // 4. Find linked Instagram Business Account
    let linkedInstagramAccountId: string | null = null;
    let facebookPageId: string | null = null;

    for (const page of pages) {
      const pageDetailsUrl = `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account,name&access_token=${longLivedToken}`;
      try {
        const res = await fetch(pageDetailsUrl);
        const data = await res.json();
        if (data.instagram_business_account) {
          linkedInstagramAccountId = data.instagram_business_account.id;
          facebookPageId = page.id;
          break; // Found the linked Instagram Business account
        }
      } catch (err: any) {
        this.logger.warn(`Failed to check linked Instagram for Page ${page.id}: ${err.message}`);
      }
    }

    if (!linkedInstagramAccountId || !facebookPageId) {
      throw new BadRequestException('No Instagram Business Account linked to any Facebook Page');
    }

    // 5. Fetch Instagram profile details
    const instagramDetailsUrl = `https://graph.facebook.com/v19.0/${linkedInstagramAccountId}?fields=username,name,profile_picture_url,followers_count&access_token=${longLivedToken}`;
    let igDetails: any;
    try {
      const res = await fetch(instagramDetailsUrl);
      igDetails = await res.json();
      if (igDetails.error) {
        this.logger.error('Failed to fetch Instagram account details:', igDetails.error);
        throw new BadRequestException(
          igDetails.error.message || 'Failed to fetch Instagram details',
        );
      }
    } catch (err: any) {
      this.logger.error(`Instagram details fetch request failed: ${err.message}`);
      throw new BadRequestException(err.message || 'Failed to read Instagram profile');
    }

    // 6. Encrypt token at rest
    const encryptedToken = encrypt(longLivedToken);

    // 7. Store in the database under ConnectedAccount and InstagramAccount
    return await this.prisma.$transaction(async (tx) => {
      // Create user if not exists (fail-safe fallback)
      await tx.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: `${userId}@mockclerk.com`, // mock email as fallback
        },
      });

      // Upsert ConnectedAccount
      const connectedAccount = await tx.connectedAccount.upsert({
        where: {
          platform_platformAccountId: {
            platform: Platform.INSTAGRAM,
            platformAccountId: linkedInstagramAccountId!,
          },
        },
        update: {
          userId,
          accessToken: encryptedToken,
          expiresAt,
          status: AccountStatus.ACTIVE,
        },
        create: {
          userId,
          platform: Platform.INSTAGRAM,
          platformAccountId: linkedInstagramAccountId!,
          accessToken: encryptedToken,
          expiresAt,
          status: AccountStatus.ACTIVE,
        },
      });

      // Upsert InstagramAccount
      await tx.instagramAccount.upsert({
        where: {
          connectedAccountId: connectedAccount.id,
        },
        update: {
          username: igDetails.username,
          displayName: igDetails.name || igDetails.username,
          profilePictureUrl: igDetails.profile_picture_url,
          followersCount: igDetails.followers_count || 0,
          isActive: true,
          facebookPageId,
        },
        create: {
          connectedAccountId: connectedAccount.id,
          username: igDetails.username,
          displayName: igDetails.name || igDetails.username,
          profilePictureUrl: igDetails.profile_picture_url,
          followersCount: igDetails.followers_count || 0,
          isActive: true,
          facebookPageId,
        },
      });

      return {
        username: igDetails.username,
        id: linkedInstagramAccountId,
      };
    });
  }

  async disconnect(userId: string, accountId: string) {
    // Delete connected account mapping (Prisma triggers CASCADE deletes linked InstagramAccount, Posts, etc.)
    const account = await this.prisma.connectedAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new BadRequestException('Connected account not found or access denied');
    }

    await this.prisma.connectedAccount.delete({
      where: {
        id: accountId,
      },
    });

    return { success: true };
  }

  async getConnectedAccounts(userId: string) {
    const accounts = await this.prisma.connectedAccount.findMany({
      where: {
        userId,
      },
      include: {
        instagramAccount: true,
      },
    });

    return accounts.map((acc) => ({
      id: acc.id,
      platform: acc.platform,
      platformAccountId: acc.platformAccountId,
      expiresAt: acc.expiresAt,
      status: acc.status,
      instagramAccount: acc.instagramAccount
        ? {
            username: acc.instagramAccount.username,
            displayName: acc.instagramAccount.displayName,
            profilePictureUrl: acc.instagramAccount.profilePictureUrl,
            followersCount: acc.instagramAccount.followersCount,
            isActive: acc.instagramAccount.isActive,
          }
        : null,
    }));
  }
}
