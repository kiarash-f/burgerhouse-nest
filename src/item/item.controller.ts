// src/items/item.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  UploadedFile,
  Param,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateItemDto } from './dtos/create-item.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ItemService } from './item.service';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { ItemQueryDto } from './dtos/item-query.dto';
import { MediaService } from '../media/media.service'; // <-- add this

@Controller('items')
export class ItemController {
  constructor(
    private readonly itemsService: ItemService,
    private readonly mediaService: MediaService, // <-- inject
  ) {}

  // Public
  @Get()
  list(@Query() q: ItemQueryDto) {
    return this.itemsService.query(q);
  }

  @Get(':id')
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  // Admin: create item with image -> upload to Cloudinary
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(), // <-- switch to memory so we can stream to Cloudinary
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB guard (tweak as you like)
    }),
  )
  @Post()
  async createItem(
    @Body() body: CreateItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!/^image\//.test(file.mimetype)) {
      throw new BadRequestException('Only image uploads are allowed');
    }

    // Upload to Cloudinary and get responsive URLs
    const media = await this.mediaService.uploadItemImage(
      file,
      `items/${body.categoryId}`, // optional folder hint
    );

    // If your ItemService.create signature hasn't changed,
    // pass the Cloudinary URL instead of local filename:
    return this.itemsService.create(
      body.name,
      body.desc,
      Number(body.price),
      media.variants.md.url, // <-- use the medium variant as the main image
      Number(body.categoryId),
      body.active ?? true,
      // If you later add mediaId to your create(), pass media.id here.
    );
  }

  // Admin: update basic fields (no image change)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    patch: {
      name?: string;
      desc?: string;
      price?: number;
      active?: boolean;
      categoryId?: number;
    },
  ) {
    return this.itemsService.updateBasic(id, patch);
  }

  // Admin: delete
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  removeItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }
}
