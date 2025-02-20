import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { JwtAuthGuard } from './auth/auth.guard';
import { RegisterDto, LoginDto } from '@app/shared';

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
