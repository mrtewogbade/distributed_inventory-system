import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ValidateTokenDto } from '@app/shared';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer', '');

    if (!token) throw new UnauthorizedException('No token provided');

    const authClient = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_SERVER || 'nats://localhost:4222'],
      },
    });

    try {
      const validateTokenDto: ValidateTokenDto = { token };
      const user = await authClient
        .send('auth.validate_token', validateTokenDto)
        .toPromise();
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token', error.message);
    }
  }
}
