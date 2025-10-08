// src/item/item.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../entities/item.entity';
import { Category } from '../entities/category.entity';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { MediaModule } from '../media/media.module'; // <-- add (adjust path if needed)

@Module({
  imports: [TypeOrmModule.forFeature([Item, Category]), MediaModule], // <-- include
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
