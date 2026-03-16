import {
  CanActivate,
  ExecutionContext, Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      console.log(bearer)
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException();
      }
      const user = this.jwtService.verify(token);
      req.user = user;
      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException({ message: 'Не автризован' });
    }
  }
}
