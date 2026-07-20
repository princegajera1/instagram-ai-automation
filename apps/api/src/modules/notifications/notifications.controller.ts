import { Controller, Get, Patch, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { NotificationsService } from './notifications.service';

function getUserId(req: any): string {
  return req.user?.id || req.user?.sub || req.user?.userId || 'anonymous';
}

@Controller('api/notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('unreadOnly') unreadOnly: string = 'false',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const unread = unreadOnly === 'true';
    return this.notificationsService.getNotifications(getUserId(req), pageNum, limitNum, unread);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(getUserId(req), id);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(getUserId(req));
  }
}
