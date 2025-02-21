import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { StoresModule } from './stores.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(StoresModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_SERVER],
    },
  });
  await app.listen();
  console.log('Stores Microservice running with NATS');
}
bootstrap();
