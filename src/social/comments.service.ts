import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, SocialPost, User } from '../entities';
import { CreateCommentDto, UpdateCommentDto } from './dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(SocialPost)
    private socialPostRepository: Repository<SocialPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(postId: number, createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    // Find the post
    const post = await this.socialPostRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Handle parent comment if provided
    let parentComment: Comment | undefined = undefined;
    if (createCommentDto.parentCommentId) {
      const foundParentComment = await this.commentRepository.findOne({ 
        where: { id: createCommentDto.parentCommentId },
        relations: ['post']
      });
      
      if (!foundParentComment) {
        throw new NotFoundException(`Parent comment with ID ${createCommentDto.parentCommentId} not found`);
      }
      
      // Verify parent comment belongs to the same post
      if (foundParentComment.post && foundParentComment.post.id !== postId) {
        throw new NotFoundException(`Parent comment does not belong to this post`);
      }
      
      parentComment = foundParentComment;
    }

    // Create the comment
    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      post,
      user,
      parentComment
    });

    const savedComment = await this.commentRepository.save(comment);
    
    // Increment comment count on the post
    post.commentCount += 1;
    await this.socialPostRepository.save(post);
    
    return savedComment;
  }

  async findAllForPost(
    postId: number,
    page = 1,
    limit = 10
  ): Promise<{ comments: Comment[], total: number, totalPages: number }> {
    // Find the post
    const post = await this.socialPostRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Get root-level comments (no parent)
    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .where('comment.post.id = :postId', { postId })
      .andWhere('comment.parentComment IS NULL')
      .andWhere('comment.isActive = :isActive', { isActive: true });

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const rootComments = await queryBuilder
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
      
    // Get replies for each root comment
    const commentsWithReplies = await Promise.all(rootComments.map(async (rootComment) => {
      const replies = await this.commentRepository.find({
        where: {
          parentComment: { id: rootComment.id },
          isActive: true
        },
        relations: ['user'],
        order: { createdAt: 'ASC' }
      });
      
      return {
        ...rootComment,
        replies
      };
    }));

    return { 
      comments: commentsWithReplies as Comment[], 
      total, 
      totalPages 
    };
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'parentComment', 'post'],
    });
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number): Promise<Comment> {
    const comment = await this.findOne(id);
    
    // Check if the user is the creator of the comment
    if (comment.user.id !== userId) {
      throw new NotFoundException(`You are not authorized to update this comment`);
    }
    
    this.commentRepository.merge(comment, {
      content: updateCommentDto.content,
      isActive: updateCommentDto.isActive
    });
    
    return this.commentRepository.save(comment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.findOne(id);
    
    // Check if the user is the creator of the comment
    if (comment.user.id !== userId) {
      throw new NotFoundException(`You are not authorized to delete this comment`);
    }
    
    // Get the post to update comment count
    const post = comment.post;
    
    // Instead of hard deleting, mark as inactive and preserve the structure
    comment.isActive = false;
    await this.commentRepository.save(comment);
    
    // Update comment count on post
    post.commentCount = Math.max(0, post.commentCount - 1);
    await this.socialPostRepository.save(post);
  }
} 