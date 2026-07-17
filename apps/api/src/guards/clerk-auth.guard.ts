import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private client?: jwksClient.JwksClient;

  constructor() {
    const jwksUri = process.env.CLERK_JWKS_URI;
    if (jwksUri) {
      this.client = jwksClient({
        jwksUri,
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
      });
    } else {
      this.logger.warn(
        'CLERK_JWKS_URI environment variable is not defined. JWT validation may fail unless bypassed.',
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.decode(token, { complete: true }) as any;
      if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new UnauthorizedException('Invalid token format');
      }

      // If JWKS client is not configured (e.g. local dev testing without keys),
      // we check if we allow local mock verification.
      if (!this.client) {
        if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
          // Mock token payload for local testing
          request.user = {
            id: decoded.payload.sub || 'mock-user-id',
            email: decoded.payload.email || 'mock@example.com',
            role: decoded.payload.metadata?.role || 'USER',
          };
          return true;
        }
        throw new UnauthorizedException('Authentication service not configured');
      }

      const key = await this.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      const verified = jwt.verify(token, publicKey, {
        issuer: process.env.CLERK_ISSUER,
        algorithms: ['RS256'],
      }) as any;

      // Extract details and attach to request context
      request.user = {
        id: verified.sub,
        email: verified.email,
        role: verified.metadata?.role || 'USER', // role-based metadata from Clerk
        claims: verified,
      };

      return true;
    } catch (err: any) {
      this.logger.error(`Token verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired session token');
    }
  }

  private getSigningKey(kid: string): Promise<jwksClient.SigningKey> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject(new Error('JWKS client not initialized'));
      }
      this.client.getSigningKey(kid, (err, key) => {
        if (err || !key) {
          return reject(err || new Error('Signing key not found'));
        }
        resolve(key);
      });
    });
  }
}
