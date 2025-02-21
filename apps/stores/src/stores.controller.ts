import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StoresService } from './stores.service';
import {
  CreateStoreDto,
  CreateStoreRoleDto,
  AddUserToStoreDto,
  UpdateStoreVerificationDto,
} from '@app/shared';

@Controller()
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @MessagePattern('stores.create')
  async createStore(data: {
    userId: string;
    token: string;
    dto: CreateStoreDto;
  }) {
    await this.storesService.validateToken(data.token);
    return this.storesService.createStore(data.userId, data.dto);
  }

  @MessagePattern('stores.get')
  async getStore(data: { storeId: string; userId: string; token: string }) {
    await this.storesService.validateToken(data.token);
    return this.storesService.getStore(data.storeId, data.userId);
  }

  @MessagePattern('stores.create_role')
  async createStoreRole(data: {
    storeId: string;
    userId: string;
    token: string;
    dto: CreateStoreRoleDto;
  }) {
    await this.storesService.validateToken(data.token);
    return this.storesService.createStoreRole(
      data.storeId,
      data.userId,
      data.dto,
    );
  }

  @MessagePattern('stores.add_user')
  async addUserToStore(data: {
    storeId: string;
    userId: string;
    token: string;
    dto: AddUserToStoreDto;
  }) {
    await this.storesService.validateToken(data.token);
    return this.storesService.addUserToStore(
      data.storeId,
      data.userId,
      data.dto,
    );
  }

  @MessagePattern('stores.update_verification')
  async updateStoreVerification(data: {
    storeId: string;
    dto: UpdateStoreVerificationDto;
  }) {
    return this.storesService.updateStoreVerification(data.storeId, data.dto);
  }
}
