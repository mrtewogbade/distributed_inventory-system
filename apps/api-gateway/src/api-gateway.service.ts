import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { RegisterDto, LoginDto, AuthResponseDto } from '@app/shared';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class ApiGatewayService {
  private authClient: ClientProxy;

  constructor() {
    this.authClient = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_SERVER || 'nats://localhost:4222'],
      },
    });
  }

  async register(registerDto: RegisterDto) {
    try {
      return firstValueFrom(this.authClient.send('auth.register', registerDto));
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      return await firstValueFrom(this.authClient.send('auth.login', loginDto));
    } catch (error: any) {
      if (error.response?.statusCode === 401) {
        throw new UnauthorizedException(error.response.message);
      }
      throw error;
    }
  }
}
