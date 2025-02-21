import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  Patch,
  Headers,
} from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { JwtAuthGuard } from './auth/auth.guard';
import {
  RegisterDto,
  LoginDto,
  UpdateUserDto,
  CreateStoreDto,
  CreateStoreRoleDto,
  AddUserToStoreDto,
  UpdateStoreVerificationDto,
} from '@app/shared';

@Controller('auth')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.apiGatewayService.register(registerDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.apiGatewayService.login(loginDto);
  }
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  async protectedRoute() {
    return { message: 'This is a protected route' };
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    return this.apiGatewayService.getUser(id, token);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    return this.apiGatewayService.updateUser(id, dto, token);
  }
}

@Controller('stores')
export class StoresController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Post('create-store')
  @UseGuards(JwtAuthGuard)
  async createStore(
    @Body() dto: CreateStoreDto,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    const user = await this.apiGatewayService.getUserFromToken(token);
    return this.apiGatewayService.createStore(user.id, dto, token);
  }

  @Get(':storeId')
  @UseGuards(JwtAuthGuard)
  async getStore(
    @Param('storeId') storeId: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    const user = await this.apiGatewayService.getUserFromToken(token);
    return this.apiGatewayService.getStore(storeId, user.id, token);
  }

  @Post(':storeId/roles')
  @UseGuards(JwtAuthGuard)
  async createStoreRole(
    @Param('storeId') storeId: string,
    @Body() dto: CreateStoreRoleDto,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    const user = await this.apiGatewayService.getUserFromToken(token);
    return this.apiGatewayService.createStoreRole(storeId, user.id, dto, token);
  }

  @Post(':storeId/users')
  @UseGuards(JwtAuthGuard)
  async addUserToStore(
    @Param('storeId') storeId: string,
    @Body() dto: AddUserToStoreDto,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    const user = await this.apiGatewayService.getUserFromToken(token);
    return this.apiGatewayService.addUserToStore(storeId, user.id, dto, token);
  }

  @Patch(':storeId/verify')
  async updateStoreVerification(
    @Param('storeId') storeId: string,
    @Body() dto: UpdateStoreVerificationDto,
  ) {
    return this.apiGatewayService.updateStoreVerification(storeId, dto);
  }
}
