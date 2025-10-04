import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true, default: null })
  desc: string | null;

  @Column({ type: 'integer' })
  price: number;

  // 👇 حتماً type رو مشخص کن
  @Column({ type: 'text', nullable: true, default: null })
  image: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => Category, (c) => c.items, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  category: Category | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
