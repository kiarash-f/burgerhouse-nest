// src/entities/category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // used by DTO and queries
  @Column({ unique: true })
  slug: string;

  // optional description (you send `desc` from Postman)
  @Column({ type: 'text', nullable: true })
  desc: string | null;

  // whether category is active (you send `active` from Postman)
  @Column({ default: true })
  active: boolean;

  // ordering in lists
  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  // main image URL from Cloudinary (media.variants.md.url)
  @Column({ type: 'text', nullable: true })
  image: string | null;

  // inverse side of Item.category
  @OneToMany(() => Item, (item) => item.category)
  items: Item[];
}
