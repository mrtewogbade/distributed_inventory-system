import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [StoresController],
  providers: [StoresService, PrismaService],
})
export class StoresModule {}
