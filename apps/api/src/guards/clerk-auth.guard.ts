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
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (request.query && request.query.token) {
      token = request.query.token as string;
    } else {
      // In bypass mode, allow requests without auth for local dev testing
      if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
        request.user = {
          id: 'dev-user-bypass',
          email: 'dev@localhost.dev',
          role: 'USER',
        };
        return true;
      }
      throw new UnauthorizedException('Authorization session token is missing');
    }

    try {
      const decoded = jwt.decode(token, { complete: true }) as any;
      if (!decoded || !decoded.header) {
        throw new UnauthorizedException('Invalid token format');
      }

      // ── Development bypass: skip JWKS verification entirely ──
      // When BYPASS_AUTH=true, just decode the token without verifying signature.
      // This allows local dev to work without a valid Clerk JWT.
      if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
        request.user = {
          id: decoded.payload?.sub || 'dev-user-bypass',
          email: decoded.payload?.email || 'dev@localhost.dev',
          role: decoded.payload?.metadata?.role || 'USER',
        };
        return true;
      }

      // ── Production path: full JWKS verification ──
      if (!this.client) {
        throw new UnauthorizedException('Authentication service not configured');
      }

      if (!decoded.header.kid) {
        throw new UnauthorizedException('Token missing key identifier (kid)');
      }

      const key = await this.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      const verified = jwt.verify(token, publicKey, {
        issuer: process.env.CLERK_ISSUER,
        algorithms: ['RS256'],
      }) as any;

      request.user = {
        id: verified.sub,
        email: verified.email,
        role: verified.metadata?.role || 'USER',
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
