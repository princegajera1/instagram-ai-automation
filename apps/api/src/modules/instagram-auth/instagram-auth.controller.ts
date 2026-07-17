import { Controller, Get, Delete, Query, Res, UseGuards, Req, Param } from '@nestjs/common';
import { Response } from 'express';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { InstagramAuthService } from './instagram-auth.service';

@Controller('api/instagram')
export class InstagramAuthController {
  private readonly frontendSettingsUrl =
    process.env.FRONTEND_SETTINGS_URL || 'http://localhost:3000/settings';

  constructor(private readonly authService: InstagramAuthService) {}

  @Get('connect')
  @UseGuards(ClerkAuthGuard)
  connect(@Req() req: any, @Res() res: Response) {
    const userId = req.user.id;
    const redirectUrl = this.authService.getConnectUrl(userId);
    return res.redirect(redirectUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code?: string,
    @Query('state') state?: string, // state represents our Clerk userId
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string,
    @Res() res?: Response,
  ) {
    const response = res!;

    // Check if user denied permission or error occurred
    if (error || !code || !state) {
      const errMsg = errorDescription || error || 'Instagram access denied';
      return response.redirect(
        `${this.frontendSettingsUrl}?status=error&message=${encodeURIComponent(errMsg)}`,
      );
    }

    try {
      const accountInfo = await this.authService.handleCallback(code, state);
      return response.redirect(
        `${this.frontendSettingsUrl}?status=success&username=${encodeURIComponent(
          accountInfo.username,
        )}&accountId=${encodeURIComponent(accountInfo.id)}`,
      );
    } catch (err: any) {
      return response.redirect(
        `${this.frontendSettingsUrl}?status=error&message=${encodeURIComponent(err.message || 'Verification failed')}`,
      );
    }
  }

  @Get('accounts')
  @UseGuards(ClerkAuthGuard)
  async getAccounts(@Req() req: any) {
    const userId = req.user.id;
    return await this.authService.getConnectedAccounts(userId);
  }

  @Delete('disconnect/:accountId')
  @UseGuards(ClerkAuthGuard)
  async disconnect(@Req() req: any, @Param('accountId') accountId: string) {
    const userId = req.user.id;
    return await this.authService.disconnect(userId, accountId);
  }
}
