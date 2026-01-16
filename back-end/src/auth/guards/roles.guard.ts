import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // If no roles are required, allow access
    if (!requiredRoles) return true;

    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();

    // Must be authenticated (AuthGuard should run first)
    if (!ctx.jwtPayload) {
      throw new UnauthorizedException();
    }

    // Check if user's role is in the required roles
    if (!requiredRoles.includes(ctx.jwtPayload.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
