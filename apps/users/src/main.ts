import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(UsersModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_SERVER || 'nats://localhost:4222'],
    },
  });
  await app.listen();
  console.log('Users Microservice running with NATS');
}
bootstrap();
