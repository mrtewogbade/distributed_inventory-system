import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AuthModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_SERVER || 'nats://localhost:4222'],
    },
  });
  await app.listen();
  console.log('Auth Microservice running with NATS');
}
bootstrap();
