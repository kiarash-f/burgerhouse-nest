// src/menu/menu.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { MenuController } from './menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [MenuController],
})
export class MenuModule {}
