// src/media/media.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../entities/media.entity';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import * as streamifier from 'streamifier';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
    private cfg: ConfigService,
  ) {}

  private uploadBufferToCloudinary(
    buffer: Buffer,
    opts: UploadApiOptions,
  ): Promise<{ public_id: string; secure_url: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
        if (err || !result) return reject(err ?? new Error('No result'));
        resolve({ public_id: result.public_id, secure_url: result.secure_url });
      });
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  // Generate transformation URLs for responsive sizes (on-the-fly)
  private urlsFor(publicId: string) {
    const mk = (w: number) =>
      cloudinary.url(publicId, {
        transformation: [
          { width: w, crop: 'limit', fetch_format: 'auto', quality: 'auto' },
        ],
      });
    return {
      thumb: { url: mk(256) },
      sm: { url: mk(512) },
      md: { url: mk(1024) },
      lg: { url: mk(1600) },
    };
  }

  async uploadItemImage(file: Express.Multer.File, folderHint?: string) {
    if (!file?.buffer) throw new BadRequestException('Empty file');
    if (!/^image\//.test(file.mimetype)) {
      throw new BadRequestException('Only image uploads are allowed');
    }

    const folderPrefix = this.cfg.get<string>('CLOUDINARY_FOLDER') || 'uploads';
    const folder = folderHint ? `${folderPrefix}/${folderHint}` : folderPrefix;

    const { public_id } = await this.uploadBufferToCloudinary(file.buffer, {
      folder,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    const variants = this.urlsFor(public_id);

    const media = this.mediaRepo.create({
      publicId: public_id,
      variants,
    });
    return this.mediaRepo.save(media);
  }
}
