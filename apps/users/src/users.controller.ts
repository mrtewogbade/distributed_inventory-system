import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UpdateUserDto } from '@app/shared';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.get')
  async getUser(data: { id: string; token: string }) {
    await this.usersService.validateToken(data.token); // Validate token first
    return this.usersService.getUser(data.id);
  }

  @MessagePattern('users.update')
  async updateUser(data: { id: string; token: string; dto: UpdateUserDto }) {
    await this.usersService.validateToken(data.token); // Validate token first
    return this.usersService.updateUser(data.id, data.dto);
  }
}
