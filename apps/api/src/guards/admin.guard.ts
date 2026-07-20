import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Checks that the user exists and holds the ADMIN role from JWT metadata
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied: Administrator role required.');
    }

    return true;
  }
}
