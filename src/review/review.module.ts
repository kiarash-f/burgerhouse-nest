import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "src/entities/review.entity";
import { ItemModule } from "src/item/item.module";
import { UsersModule } from "src/users/users.module";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";


@Module({
    imports:[TypeOrmModule.forFeature([Review]), ItemModule, UsersModule],
    controllers:[ReviewController],
    providers:[ReviewService],
    exports:[ReviewService]
})
export class ReviewModule{}