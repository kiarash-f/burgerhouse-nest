import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Item } from '../entities/item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  itemId: number;

  @ManyToOne(() => Item, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'itemId' })
  item?: Item | null; // optional relation for reference

  @Column({ type: 'varchar', length: 255 })
  name: string; // snapshot

  @Column({ type: 'text', nullable: true })
  desc?: string | null; // snapshot

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string; // snapshot at order time

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  note?: string | null;
}
