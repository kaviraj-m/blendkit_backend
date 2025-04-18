import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialPostsController } from './social-posts.controller';
import { SocialPostsService } from './social-posts.service';
import { EndorsementsController } from './endorsements.controller';
import { EndorsementsService } from './endorsements.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { SocialPost, User, Comment, Endorsement, Role } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SocialPost,
      User,
      Comment,
      Endorsement,
      Role
    ]),
  ],
  controllers: [
    SocialPostsController,
    EndorsementsController,
    CommentsController,
  ],
  providers: [
    SocialPostsService,
    EndorsementsService,
    CommentsService,
  ],
  exports: [
    SocialPostsService,
    EndorsementsService,
    CommentsService,
  ],
})
export class SocialModule {} 