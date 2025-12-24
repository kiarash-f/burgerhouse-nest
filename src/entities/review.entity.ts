import { Entity , PrimaryGeneratedColumn , Column , ManyToOne , CreateDateColumn , UpdateDateColumn} from "typeorm";
import { Item } from "./item.entity";
import { User } from "./user.entity";



@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    comment:string;

    @Column()
    rating:number;

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @ManyToOne(()=> Item , (item) => item.reviews , { onDelete: 'CASCADE' });
    item:Item;

    @ManyToOne(()=> User , (user)=> user.reviews , { onDelete: 'CASCADE' });
    user:User;
}

//add oneToMany relation in item and user entities
// what onDelete cascade does?
// Add rules for rating and commenting 