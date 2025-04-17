import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Endorsement, SocialPost, User, Role } from '../entities';

@Injectable()
export class EndorsementsService {
  private readonly logger = new Logger(EndorsementsService.name);
  
  constructor(
    @InjectRepository(Endorsement)
    private endorsementRepository: Repository<Endorsement>,
    @InjectRepository(SocialPost)
    private socialPostRepository: Repository<SocialPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async endorsePost(postId: number, userId: number): Promise<{ success: boolean, endorsementCount: number, userRole: string }> {
    // Find the post
    const post = await this.socialPostRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Find the user with their role
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['role'] 
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the user already endorsed this post
    const existingEndorsement = await this.endorsementRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId }
      }
    });

    if (existingEndorsement) {
      throw new ConflictException(`You have already endorsed this post`);
    }

    // Get the user's role name
    const userRole = user.role ? user.role.name.toLowerCase() : 'unknown';

    // Create the endorsement
    const endorsement = this.endorsementRepository.create({
      post,
      user,
      userRole
    });

    await this.endorsementRepository.save(endorsement);

    // Increment the endorsement count on the post
    post.endorsementCount += 1;
    await this.socialPostRepository.save(post);

    return {
      success: true,
      endorsementCount: post.endorsementCount,
      userRole
    };
  }

  async removeEndorsement(postId: number, userId: number): Promise<{ success: boolean, endorsementCount: number }> {
    // Find the post
    const post = await this.socialPostRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Find the endorsement
    const endorsement = await this.endorsementRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId }
      }
    });

    if (!endorsement) {
      throw new NotFoundException(`You have not endorsed this post`);
    }

    // Remove the endorsement
    await this.endorsementRepository.remove(endorsement);

    // Decrement the endorsement count on the post
    post.endorsementCount = Math.max(0, post.endorsementCount - 1);
    await this.socialPostRepository.save(post);

    return {
      success: true,
      endorsementCount: post.endorsementCount
    };
  }

  async getEndorsementsForPost(
    postId: number,
    page = 1,
    limit = 10,
    role?: string
  ): Promise<{ endorsements: Endorsement[], total: number, totalPages: number }> {
    // Find the post
    const post = await this.socialPostRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Build the query
    const queryBuilder = this.endorsementRepository.createQueryBuilder('endorsement')
      .leftJoinAndSelect('endorsement.user', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .where('endorsement.post.id = :postId', { postId });

    if (role) {
      queryBuilder.andWhere('LOWER(endorsement.userRole) = LOWER(:role)', { role });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const endorsements = await queryBuilder
      .orderBy('endorsement.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { endorsements, total, totalPages };
  }
} 