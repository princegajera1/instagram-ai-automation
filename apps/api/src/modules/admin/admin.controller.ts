import { Controller, Get, Patch, Query, Param, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { AdminService } from './admin.service';

@Controller('api/admin')
@UseGuards(ClerkAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.adminService.getUsers(pageNum, limitNum, search);
  }

  @Patch('users/:id/toggle-active')
  toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id);
  }

  @Get('analytics')
  getOverviewStats() {
    return this.adminService.getOverviewStats();
  }

  @Get('logs')
  getAuditLogs(@Query('limit') limit?: string) {
    const limitNum = parseInt(limit || '50', 10) || 50;
    return this.adminService.getAuditLogs(limitNum);
  }

  @Get('system-health')
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('api-usage')
  getApiUsage() {
    return this.adminService.getApiUsage();
  }
}
