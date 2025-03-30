import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymPostsService } from './gym-posts.service';
import { GymPostsController } from './gym-posts.controller';
import { GymPost } from '../entities/gym-post.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GymPost, User])],
  controllers: [GymPostsController],
  providers: [GymPostsService],
  exports: [GymPostsService],
})
export class GymPostsModule {} 