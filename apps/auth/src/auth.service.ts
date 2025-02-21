import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  LoginDto,
  ValidateTokenDto,
  AuthResponseDto,
  UserDto,
} from '@app/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserDto> {
    try {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
        },
      });
      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Registration failed due to an unexpected error',
        error.message,
      );
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }
      const passwordMatch = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }
      const payload = { sub: user.id, email: user.email };
      const token = this.jwtService.sign(payload);
      console.log('Generated token:', token); // Debug log
      return { accessToken: token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Login failed due to an unexpected error',
        error.message,
      );
    }
  }

  // async login(loginDto: LoginDto): Promise<AuthResponseDto> {
  //   try {
  //     const user = await this.prisma.user.findUnique({
  //       where: { email: loginDto.email },
  //     });
  //     if (!user) {
  //       throw new UnauthorizedException('Invalid email or password');
  //     }
  //     const passwordMatch = await bcrypt.compare(
  //       loginDto.password,
  //       user.password,
  //     );
  //     if (!passwordMatch) {
  //       throw new UnauthorizedException('Invalid email or password');
  //     }
  //     const payload = { sub: user.id, email: user.email };
  //     return {
  //       accessToken: this.jwtService.sign(payload),
  //     };
  //   } catch (error) {
  //     if (error instanceof UnauthorizedException) {
  //       throw error;
  //     }
  //     throw new UnauthorizedException(
  //       'Login failed due to an unexpected error',
  //       error.message,
  //     );
  //   }
  // }

  // async validateToken(validateTokenDto: ValidateTokenDto): Promise<UserDto> {
  //   try {
  //     const decoded = this.jwtService.verify(validateTokenDto.token);
  //     return { id: decoded.sub, email: decoded.email };
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid token', error.message);
  //   }
  // }

  async validateToken(validateTokenDto: ValidateTokenDto): Promise<UserDto> {
    try {
      const decoded = this.jwtService.verify(validateTokenDto.token);
      console.log('Token decoded successfully:', decoded);
      return { id: decoded.sub, email: decoded.email };
    } catch (error) {
      console.error('Token verification error:', error.name, error.message);
      throw new UnauthorizedException('Invalid token', error.message);
    }
  }
}
