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
import { ItemService } from './item.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { ItemQueryDto } from './dtos/item-query.dto';

@Controller('items')
export class ItemController {
  constructor(private itemsService: ItemService) {}

  // عمومی
  @Get()
  list(@Query() q: ItemQueryDto) {
    return this.itemsService.query(q);
  }

  @Get(':id')
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  // ادمین
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const randomName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Post()
  createItem(
    @Body() body: CreateItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.itemsService.create(
      body.name,
      body.desc,
      Number(body.price),
      file.filename,
      Number(body.categoryId),
      body.active ?? true,
    );
  }

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  removeItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }
}
