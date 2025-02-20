import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ValidateTokenDto } from '@app/shared';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @MessagePattern('auth.login')
  async login(loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern('auth.validate')
  async validateToken(validateTokenDto: ValidateTokenDto) {
    return this.authService.validateToken(validateTokenDto);
  }
}
