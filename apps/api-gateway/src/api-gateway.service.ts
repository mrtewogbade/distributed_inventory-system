import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UpdateUserDto,
  CreateStoreDto,
  CreateStoreRoleDto,
  AddUserToStoreDto,
  UpdateStoreVerificationDto,
} from '@app/shared';
import { ForbiddenException } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class ApiGatewayService {
  private authClient: ClientProxy;
  private usersClient: ClientProxy;
  private storesClient: ClientProxy;

  constructor() {
    const natsServer = process.env.NATS_SERVER || 'nats://localhost:4222';
    this.authClient = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: { servers: [natsServer] },
    });
    this.usersClient = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: { servers: [natsServer] },
    });
    this.storesClient = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: { servers: [natsServer] },
    });
  }

  async getUserFromToken(token: string) {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.validate_token', { token }),
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid token', error.message);
    }
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

  async getUser(id: string, token: string) {
    try {
      return await firstValueFrom(
        this.usersClient.send('users.get', { id, token }),
      );
    } catch (error: any) {
      if (error.statusCode === 401) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  async updateUser(id: string, dto: UpdateUserDto, token: string) {
    try {
      return await firstValueFrom(
        this.usersClient.send('users.update', { id, token, dto }),
      );
    } catch (error: any) {
      if (error.statusCode === 401) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  // STORES

  // async createStore(userId: string, dto: CreateStoreDto, token: string) {
  //   try {
  //     return await firstValueFrom(
  //       this.storesClient.send('stores.create', { userId, token, dto }),
  //     );
  //   } catch (error: any) {
  //     if (error.statusCode === 401 || error.statusCode === 403)
  //       throw new UnauthorizedException(error.message);
  //     throw error; // Unhandled errors become 500
  //   }
  // }

  // async createStore(userId: string, dto: CreateStoreDto, token: string) {
  //   try {
  //     return await firstValueFrom(
  //       this.storesClient.send('stores.create', { userId, token, dto }),
  //     );
  //   } catch (error: any) {
  //     console.error('Create store error:', error); // Debug log
  //     if (
  //       error?.message?.includes('Invalid token') ||
  //       error?.statusCode === 401
  //     ) {
  //       throw new UnauthorizedException(error.message || 'Invalid token');
  //     }
  //     if (error?.statusCode === 403) {
  //       throw new ForbiddenException(error.message);
  //     }
  //     throw new InternalServerErrorException('Failed to create store');
  //   }
  // }

  async createStore(userId: string, dto: CreateStoreDto, token: string) {
    try {
      return await firstValueFrom(
        this.storesClient.send('stores.create', { userId, token, dto }),
      );
    } catch (error: any) {
      console.error('Create store error:', error); // Debug log
      if (
        error?.response?.statusCode === 401 ||
        error?.message?.includes('Invalid token')
      ) {
        throw new UnauthorizedException(
          error.response?.message || 'Invalid token',
        );
      }
      if (error?.response?.statusCode === 403) {
        throw new ForbiddenException(error.response?.message);
      }
      throw new InternalServerErrorException(
        error.response?.message || 'Failed to create store',
      );
    }
  }

  async getStore(storeId: string, userId: string, token: string) {
    try {
      return await firstValueFrom(
        this.storesClient.send('stores.get', { storeId, userId, token }),
      );
    } catch (error: any) {
      if (error.statusCode === 401 || error.statusCode === 403)
        throw new UnauthorizedException(error.message);
      throw error;
    }
  }

  async createStoreRole(
    storeId: string,
    userId: string,
    dto: CreateStoreRoleDto,
    token: string,
  ) {
    try {
      return await firstValueFrom(
        this.storesClient.send('stores.create_role', {
          storeId,
          userId,
          token,
          dto,
        }),
      );
    } catch (error: any) {
      if (error.statusCode === 401 || error.statusCode === 403)
        throw new UnauthorizedException(error.message);
      throw error;
    }
  }

  async addUserToStore(
    storeId: string,
    userId: string,
    dto: AddUserToStoreDto,
    token: string,
  ) {
    try {
      return await firstValueFrom(
        this.storesClient.send('stores.add_user', {
          storeId,
          userId,
          token,
          dto,
        }),
      );
    } catch (error: any) {
      if (error.statusCode === 401 || error.statusCode === 403)
        throw new UnauthorizedException(error.message);
      throw error;
    }
  }

  async updateStoreVerification(
    storeId: string,
    dto: UpdateStoreVerificationDto,
  ) {
    try {
      return await firstValueFrom(
        this.storesClient.send('stores.update_verification', { storeId, dto }),
      );
    } catch (error: any) {
      if (error.statusCode === 401 || error.statusCode === 403)
        throw new UnauthorizedException(error.message);
      throw error;
    }
  }
}
