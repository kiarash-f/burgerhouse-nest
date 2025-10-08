// src/media/media.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../entities/media.entity';
import { MediaService } from './media.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  providers: [MediaService, CloudinaryProvider],
  exports: [MediaService],
})
export class MediaModule {}
