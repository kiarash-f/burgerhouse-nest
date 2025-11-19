import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { MediaService } from '../media/media.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly svc: CategoriesService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  // -------------------------------------
  // CREATE category with required image
  // -------------------------------------
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!/^image\//.test(file.mimetype)) {
      throw new BadRequestException('Only image uploads are allowed');
    }

    const media = await this.mediaService.uploadCategoryImage(file);

    return this.svc.create({
      ...dto,
      // use medium variant as main image URL
      image: media.variants.md.url,
    });
  }

  // -------------------------------------
  // UPDATE category (fields + optional image)
  // -------------------------------------
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (file) {
      if (!/^image\//.test(file.mimetype)) {
        throw new BadRequestException('Only image uploads are allowed');
      }

      const media = await this.mediaService.uploadCategoryImage(file);
      imageUrl = media.variants.md.url;
    }

    return this.svc.update(id, {
      ...dto,
      ...(imageUrl ? { image: imageUrl } : {}),
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
