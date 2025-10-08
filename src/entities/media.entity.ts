// src/media/entities/media.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', default: 'image' })
  kind: 'image';

  @Column({ type: 'text', default: 'cloudinary' })
  provider: 'cloudinary';

  @Column({ type: 'text' })
  publicId: string; // Cloudinary public_id

  @Column({ type: 'json' })
  variants: Record<string, { url: string }>; // { thumb:{url}, sm:{url}, md:{url}, lg:{url} }

  @CreateDateColumn()
  createdAt: Date;
}
