import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
      });
    }

    let admin;

    try {
      admin = await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
      });
    }

    if (!admin?.sub) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
      });
    }

    request.admin = {
      id: admin.sub,
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
    };

    return true;
  }
}
