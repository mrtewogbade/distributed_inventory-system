import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';

@Module({
  imports: [
    JwtModule.register({
      secret: 'my-super-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    { provide: 'APP_FILTER', useClass: RpcExceptionFilter },
  ],
})
export class AuthModule {}
