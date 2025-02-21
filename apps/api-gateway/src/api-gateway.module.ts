import { Module } from '@nestjs/common';
import {
  ApiGatewayController,
  UsersController,
} from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.startegy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [ApiGatewayController, UsersController],
  providers: [ApiGatewayService, JwtStrategy],
})
export class ApiGatewayModule {}
