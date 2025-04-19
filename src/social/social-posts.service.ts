import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialPost, User, Comment, Endorsement } from '../entities';
import { CreateSocialPostDto, UpdateSocialPostDto } from './dto';
import { Role } from '../entities/role.entity';
import { MediaService } from '../media/media.service';
import { UploadResponseDto } from '../media/dto/upload-response.dto';

@Injectable()
export class SocialPostsService {
  private readonly logger = new Logger(SocialPostsService.name);
  
  constructor(
    @InjectRepository(SocialPost)
    private socialPostRepository: Repository<SocialPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Endorsement)
    private endorsementRepository: Repository<Endorsement>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private mediaService: MediaService,
  ) {}

  async create(createSocialPostDto: CreateSocialPostDto, userId: number): Promise<SocialPost> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const post = this.socialPostRepository.create({
      ...createSocialPostDto,
      createdBy: user,
    });

    return this.socialPostRepository.save(post);
  }

  async uploadMediaForPost(
    postId: number, 
    file: Express.Multer.File,
    userId: number
  ): Promise<{ post: SocialPost, media: UploadResponseDto }> {
    // Find the post first
    const post = await this.findOne(postId);
    
    // Check if user is the post owner
    if (post.createdBy.id !== userId) {
      throw new NotFoundException('Not authorized to upload media for this post');
    }
    
    // Upload the file to Cloudinary
    const mediaUpload = await this.mediaService.uploadFile(file, 'social-posts');
    
    // Update the post mediaUrls array
    const mediaUrl = mediaUpload.secure_url;
    if (!post.mediaUrls) {
      post.mediaUrls = [mediaUrl];
    } else {
      post.mediaUrls.push(mediaUrl);
    }
    
    // Save the updated post
    const updatedPost = await this.socialPostRepository.save(post);
    
    return {
      post: updatedPost,
      media: mediaUpload
    };
  }

  async findAll(
    category?: string, 
    userId?: number, 
    page = 1, 
    limit = 10
  ): Promise<{ posts: SocialPost[], total: number, totalPages: number }> {
    const queryBuilder = this.socialPostRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.createdBy', 'user')
      .where('post.isActive = :isActive', { isActive: true });

    if (category) {
      queryBuilder.andWhere('post.category = :category', { category });
    }

    if (userId) {
      queryBuilder.andWhere('post.createdBy.id = :userId', { userId });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);
    
    const posts = await queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { posts, total, totalPages };
  }

  async findOne(id: number): Promise<SocialPost> {
    const post = await this.socialPostRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }

  async update(id: number, updateSocialPostDto: UpdateSocialPostDto, userId: number): Promise<SocialPost> {
    const post = await this.findOne(id);
    
    // Check if the user is the creator of the post
    if (post.createdBy.id !== userId) {
      throw new NotFoundException(`You are not authorized to update this post`);
    }
    
    this.socialPostRepository.merge(post, updateSocialPostDto);
    return this.socialPostRepository.save(post);
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.findOne(id);
    
    // Check if the user is the creator of the post
    if (post.createdBy.id !== userId) {
      throw new NotFoundException(`You are not authorized to delete this post`);
    }
    
    await this.socialPostRepository.remove(post);
  }
  
  async getPostsForFeed(
    page = 1, 
    limit = 10,
    currentUserId?: number
  ): Promise<{ posts: any[], total: number, totalPages: number }> {
    const queryBuilder = this.socialPostRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.createdBy', 'user')
      .where('post.isActive = :isActive', { isActive: true });

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);
    
    const posts = await queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // If a user is logged in, check if they've endorsed each post
    if (currentUserId) {
      const postsWithEndorsements = await Promise.all(posts.map(async (post) => {
        const hasEndorsed = await this.endorsementRepository.findOne({
          where: {
            post: { id: post.id },
            user: { id: currentUserId }
          }
        });
        
        return {
          ...post,
          hasEndorsed: !!hasEndorsed
        };
      }));
      
      return { posts: postsWithEndorsements, total, totalPages };
    }
    
    return { posts, total, totalPages };
  }
} 