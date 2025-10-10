// src/entities/cart-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Item } from './item.entity';

@Entity('cart-items')
@Unique(['userId', 'itemId']) // unique per user cart
@Unique(['sessionId', 'itemId']) // unique per dine-in session cart
@Index('idx_cart_user_item', ['userId', 'itemId'])
@Index('idx_cart_session_item', ['sessionId', 'itemId'])
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  // For logged-in users; nullable so dine-in carts work too
  @Column({ type: 'integer', nullable: true })
  userId: number | null;

  // Dine-in session identifier (from cookie), nullable so user carts work too
  @Column({ type: 'text', nullable: true })
  sessionId: string | null;

  @Column({ type: 'integer' })
  itemId: number;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  // Optional: attach a table id (you can set this at order time if you prefer)
  @Column({ type: 'integer', nullable: true })
  tableId: number | null;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @ManyToOne(() => Item, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
