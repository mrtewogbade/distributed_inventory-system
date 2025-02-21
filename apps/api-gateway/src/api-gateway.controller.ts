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
import { RegisterDto, LoginDto, UpdateUserDto } from '@app/shared';

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
