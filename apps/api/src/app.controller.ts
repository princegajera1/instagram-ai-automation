import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('admin/test')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAdminTest(@Req() req: any) {
    return {
      message: 'Access granted. Welcome, Admin!',
      user: req.user,
    };
  }

  @Get('dashboard/test')
  @UseGuards(ClerkAuthGuard)
  getDashboardTest(@Req() req: any) {
    return {
      message: 'Access granted to authenticated user.',
      user: req.user,
    };
  }
}
