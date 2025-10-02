import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '../entities/item.entity';

@Injectable()
export class ItemService {
  constructor(@InjectRepository(Item) private repo: Repository<Item>) {}

  create(name: string, desc: string, price: number, image: string) {
    const item = this.repo.create({ name, desc, price, image });

    return this.repo.save(item);
  }
  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }
  findAll() {
    return this.repo.find();
  }
}
