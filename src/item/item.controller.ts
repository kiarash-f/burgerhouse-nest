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
} from '@nestjs/common';
import { CreateItemDto } from './dtos/create-item.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemService } from './item.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('item')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ItemController {
  constructor(private itemsServivce: ItemService) {}
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Post('/create')
  @Roles('ADMIN')
  createItem(
    @Body() body: CreateItemDto,
    @UploadedFile() uploadedFile: Express.Multer.File,
  ) {
    if (!uploadedFile) {
      throw new BadRequestException('No file uploaded');
    }

    return this.itemsServivce.create(
      body.name,
      body.desc,
      Number(body.price),
      uploadedFile.filename,
    );
  }
  @Get('/:id')
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemsServivce.findOne(id);
  }
  @Get()
  getAllItems() {
    return this.itemsServivce.findAll();
  }
}
