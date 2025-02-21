import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateStoreDto,
  StoreDto,
  CreateStoreRoleDto,
  StoreRoleDto,
  AddUserToStoreDto,
  StoreMemberDto,
  UpdateStoreVerificationDto,
  UserDto,
  Permission,
} from '@app/shared';

@Injectable()
export class StoresService {
  private authClient: ClientProxy;

  constructor(private readonly prisma: PrismaService) {
    this.authClient = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        servers: [process.env.AUTH_SERVICE_NATS || 'nats://localhost:4222'],
      },
    });
  }

  // async validateToken(token: string): Promise<UserDto> {
  //   try {
  //     return await firstValueFrom(
  //       this.authClient.send('auth.validate_token', { token }),
  //     );
  //   } catch (error) {
  //     throw new UnauthorizedException(
  //       'Invalid token',
  //       error instanceof Error ? error.message : String(error),
  //     );
  //   }
  // }

  async validateToken(token: string): Promise<UserDto> {
    console.log('Validating token:', token); // Debug log
    try {
      const result = await firstValueFrom(
        this.authClient.send('auth.validate_token', { token }),
      );
      console.log('Token validation result:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Token validation error:', error); // Debug log
      throw new UnauthorizedException(
        'Invalid token',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async createStore(userId: string, dto: CreateStoreDto): Promise<StoreDto> {
    const store = await this.prisma.store.create({
      data: {
        businessName: dto.businessName,
        businessType: dto.businessType,
        phoneNumber: dto.phoneNumber,
        businessEmail: dto.businessEmail,
        location: dto.location,
        logoUrl: dto.logoUrl,
      },
    });

    const adminRole = await this.prisma.storeRole.create({
      data: {
        storeId: store.id,
        title: 'Admin',
        permissions: [
          Permission.VIEW_STORE,
          Permission.MANAGE_USERS,
          Permission.VIEW_INVENTORY,
          Permission.EDIT_INVENTORY,
          Permission.VIEW_ORDERS,
          Permission.EDIT_ORDERS,
        ] as const, // Ensure type safety
      },
    });

    await this.prisma.storeMember.create({
      data: {
        storeId: store.id,
        userId,
        roleId: adminRole.id,
      },
    });

    return {
      id: store.id,
      businessName: store.businessName,
      businessType: store.businessType,
      phoneNumber: store.phoneNumber,
      businessEmail: store.businessEmail,
      location: store.location,
      logoUrl: store.logoUrl,
      isVerified: store.isVerified,
      createdAt: store.createdAt.toISOString(),
    };
  }

  async getStore(storeId: string, userId: string): Promise<StoreDto> {
    const membership = await this.prisma.storeMember.findFirst({
      where: { storeId, userId },
    });
    if (!membership) {
      throw new ForbiddenException('You do not have access to this store');
    }

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new UnauthorizedException('Store not found');
    }

    return {
      id: store.id,
      businessName: store.businessName,
      businessType: store.businessType,
      phoneNumber: store.phoneNumber,
      businessEmail: store.businessEmail,
      location: store.location,
      logoUrl: store.logoUrl,
      isVerified: store.isVerified,
      createdAt: store.createdAt.toISOString(),
    };
  }

  async createStoreRole(
    storeId: string,
    userId: string,
    dto: CreateStoreRoleDto,
  ): Promise<StoreRoleDto> {
    const membership = await this.prisma.storeMember.findFirst({
      where: { storeId, userId },
      include: { role: true },
    });
    if (
      !membership ||
      !membership.role?.permissions.includes(Permission.MANAGE_USERS)
    ) {
      throw new ForbiddenException('Only admins can create roles');
    }

    const role = await this.prisma.storeRole.create({
      data: {
        storeId,
        title: dto.title,
        permissions: dto.permissions,
      },
    });

    return {
      id: role.id,
      storeId,
      title: role.title,
      permissions: role.permissions as Permission[], // Cast to Permission[]
    };
  }

  async addUserToStore(
    storeId: string,
    userId: string,
    dto: AddUserToStoreDto,
  ): Promise<StoreMemberDto> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store?.isVerified) {
      throw new ForbiddenException('Store must be verified to add users');
    }

    const requesterMembership = await this.prisma.storeMember.findFirst({
      where: { storeId, userId },
      include: { role: true },
    });
    if (
      !requesterMembership ||
      !requesterMembership.role?.permissions.includes(Permission.MANAGE_USERS)
    ) {
      throw new ForbiddenException('Only admins can add users to a store');
    }

    const existingMembership = await this.prisma.storeMember.findFirst({
      where: { storeId, userId: dto.userId },
    });
    if (existingMembership) {
      throw new UnauthorizedException('User is already a member of this store');
    }

    const membership = await this.prisma.storeMember.create({
      data: {
        storeId,
        userId: dto.userId,
        roleId: dto.roleId || null,
      },
      include: { role: true },
    });

    return {
      id: membership.id,
      storeId,
      userId: dto.userId,
      roleId: membership.roleId,
      role: membership.role
        ? {
            id: membership.role.id,
            storeId,
            title: membership.role.title,
            permissions: membership.role.permissions as Permission[], // Cast to Permission[]
          }
        : undefined,
    };
  }

  async updateStoreVerification(
    storeId: string,
    dto: UpdateStoreVerificationDto,
  ): Promise<StoreDto> {
    const store = await this.prisma.store.update({
      where: { id: storeId },
      data: { isVerified: dto.isVerified },
    });

    return {
      id: store.id,
      businessName: store.businessName,
      businessType: store.businessType,
      phoneNumber: store.phoneNumber,
      businessEmail: store.businessEmail,
      location: store.location,
      logoUrl: store.logoUrl,
      isVerified: store.isVerified,
      createdAt: store.createdAt.toISOString(),
    };
  }
}
