import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto, UpdateUserDto } from '@app/shared';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  private authClient: ClientProxy;

  constructor(private readonly prisma: PrismaService) {
    this.authClient = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        servers: [process.env.AUTH_SERVICE_NATS || 'nats://localhost:4222'],
      },
    });
  }

  async validateToken(token: string): Promise<UserDto> {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.validate_token', { token }),
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid token', error.message);
    }
  }

  async getUser(id: any): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, email: user.email, name: user.name };
  }

  async updateUser(id: any, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { name: dto.name },
    });
    return { id: user.id, email: user.email, name: user.name };
  }
}
