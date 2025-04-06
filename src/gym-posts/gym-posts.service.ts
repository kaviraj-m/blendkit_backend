import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGymPostDto } from './dto/create-gym-post.dto';
import { UpdateGymPostDto } from './dto/update-gym-post.dto';
import { GymPost } from '../entities/gym-post.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class GymPostsService implements OnModuleInit {
  private readonly logger = new Logger(GymPostsService.name);
  
  constructor(
    @InjectRepository(GymPost)
    private gymPostRepository: Repository<GymPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  
  async onModuleInit() {
    try {
      // Check if we have any gym posts using a simpler query
      const count = await this.gymPostRepository
        .createQueryBuilder('gymPost')
        .select('COUNT(gymPost.id)', 'count')
        .getRawOne()
        .then(result => parseInt(result?.count || '0', 10))
        .catch(error => {
          this.logger.error(`Error counting gym posts: ${error.message}`);
          return 0;
        });
      
      this.logger.log(`Count query returned: ${count} posts`);
      
      if (count === 0) {
        this.logger.log('No gym posts found. Creating sample data...');
        await this.createSampleData();
      } else {
        this.logger.log(`Found ${count} existing gym posts. Skipping sample data creation.`);
      }
    } catch (error) {
      this.logger.error(`Error in onModuleInit: ${error.message}`, error.stack);
      // Continue app initialization even if this fails
    }
  }
  
  private async createSampleData() {
    try {
      // Try different approaches to find a user
      let creator: User | null = null;
      
      // Try to find a gym_staff user first
      try {
        creator = await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.role', 'role')
          .where('role.name = :roleName', { roleName: 'gym_staff' })
          .getOne();
        
        if (creator) {
          this.logger.log(`Found gym_staff user: ${creator.id} for sample data`);
        }
      } catch (error) {
        this.logger.warn(`Error finding gym_staff user: ${error.message}`);
      }
      
      // If no gym_staff user, try to find any user
      if (!creator) {
        try {
          creator = await this.userRepository
            .createQueryBuilder('user')
            .orderBy('user.id', 'ASC')
            .getOne();
          
          if (creator) {
            this.logger.log(`Using user with ID: ${creator.id} for sample data`);
          }
        } catch (error) {
          this.logger.warn(`Error finding any user: ${error.message}`);
        }
      }
      
      // If still no user, create a test user
      if (!creator) {
        this.logger.warn('No users found. Cannot create sample gym posts.');
        return;
      }
      
      await this.createSamplePosts(creator);
    } catch (error) {
      this.logger.error(`Error creating sample data: ${error.message}`, error.stack);
    }
  }
  
  private async createSamplePosts(creator: User) {
    const samplePosts = [
      {
        title: 'Beginner Strength Training',
        content: 'This workout is perfect for beginners focusing on building strength. Start with 3 sets of 10 reps for each exercise:\n\n- Squats\n- Push-ups\n- Dumbbell rows\n- Plank (30 seconds)\n\nRest 60 seconds between sets.',
        bodyType: 'lean',
        exerciseType: 'strength',
        createdBy: creator
      },
      {
        title: 'HIIT Cardio Workout',
        content: 'High-intensity interval training to boost your cardio fitness:\n\n1. 30 seconds jumping jacks\n2. 30 seconds mountain climbers\n3. 30 seconds burpees\n4. 30 seconds high knees\n\nRest 15 seconds between exercises. Complete 4 rounds.',
        bodyType: 'athletic',
        exerciseType: 'cardio',
        createdBy: creator
      },
      {
        title: 'Yoga for Flexibility',
        content: 'Improve your flexibility with this 20-minute yoga routine:\n\n- Downward dog (30 seconds)\n- Warrior I & II (30 seconds each side)\n- Triangle pose (30 seconds each side)\n- Child\'s pose (30 seconds)\n\nFocus on deep breathing throughout.',
        bodyType: 'average',
        exerciseType: 'flexibility',
        createdBy: creator
      }
    ];
    
    for (const postData of samplePosts) {
      const post = this.gymPostRepository.create(postData);
      await this.gymPostRepository.save(post);
      this.logger.log(`Created sample post: ${post.title}`);
    }
    
    this.logger.log(`Successfully created ${samplePosts.length} sample gym posts.`);
  }

  async create(createGymPostDto: CreateGymPostDto, user: any): Promise<GymPost> {
    const staffUser = await this.userRepository.findOne({ where: { id: user.userId } });
    if (!staffUser) {
      throw new NotFoundException(`User not found`);
    }

    const gymPost = this.gymPostRepository.create({
      ...createGymPostDto,
      createdBy: staffUser,
    });

    return this.gymPostRepository.save(gymPost);
  }

  async findAll(bodyType?: string, exerciseType?: string, isActive?: boolean): Promise<GymPost[]> {
    this.logger.log(`Finding all gym posts with filters: bodyType=${bodyType}, exerciseType=${exerciseType}, isActive=${isActive}`);
    
    try {
      // Try a more direct query approach
      let query = `
        SELECT gp.*, u.id as "creator_id", u.name as "creator_name" 
        FROM gym_posts gp
        LEFT JOIN users u ON gp."createdById" = u.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (bodyType) {
        query += ` AND gp."bodyType" = $${paramIndex}`;
        params.push(bodyType);
        paramIndex++;
      }
      
      if (exerciseType) {
        query += ` AND gp."exerciseType" = $${paramIndex}`;
        params.push(exerciseType);
        paramIndex++;
      }
      
      if (isActive !== undefined) {
        query += ` AND gp."isActive" = $${paramIndex}`;
        params.push(isActive);
        paramIndex++;
      } else {
        query += ` AND gp."isActive" = $${paramIndex}`;
        params.push(true);
        paramIndex++;
      }
      
      query += ` ORDER BY gp."createdAt" DESC`;
      
      this.logger.log(`Direct SQL: ${query}`);
      this.logger.log(`Query parameters: ${JSON.stringify(params)}`);
      
      // Execute the direct query
      const result = await this.gymPostRepository.query(query, params);
      this.logger.log(`Direct query found ${result.length} posts`);
      
      // Transform the result to match the expected structure
      const posts = result.map(row => {
        const post = new GymPost();
        Object.assign(post, {
          id: row.id,
          title: row.title,
          content: row.content,
          imageUrl: row.imageUrl,
          bodyType: row.bodyType,
          exerciseType: row.exerciseType,
          isActive: row.isActive,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          createdBy: {
            id: row.creator_id,
            name: row.creator_name
          }
        });
        return post;
      });
      
      return posts;
    } catch (error) {
      this.logger.error(`Error in findAll: ${error.message}`, error.stack);
      
      // Fallback to standard repository approach if the direct query fails
      try {
        this.logger.log('Trying fallback query approach...');
        const query = this.gymPostRepository.createQueryBuilder('gymPost')
          .leftJoinAndSelect('gymPost.createdBy', 'user');

        if (bodyType) {
          query.andWhere('gymPost.bodyType = :bodyType', { bodyType });
        }

        if (exerciseType) {
          query.andWhere('gymPost.exerciseType = :exerciseType', { exerciseType });
        }

        if (isActive !== undefined) {
          query.andWhere('gymPost.isActive = :isActive', { isActive });
        } else {
          // Default to active posts only
          query.andWhere('gymPost.isActive = :isActive', { isActive: true });
        }

        const posts = await query.orderBy('gymPost.createdAt', 'DESC').getMany();
        this.logger.log(`Fallback query found ${posts.length} posts`);
        return posts;
      } catch (fallbackError) {
        this.logger.error(`Fallback query failed: ${fallbackError.message}`, fallbackError.stack);
        throw fallbackError;
      }
    }
  }

  async findOne(id: number): Promise<GymPost> {
    const gymPost = await this.gymPostRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    
    if (!gymPost) {
      throw new NotFoundException(`Gym post with ID ${id} not found`);
    }
    
    return gymPost;
  }

  async update(id: number, updateGymPostDto: UpdateGymPostDto): Promise<GymPost> {
    const gymPost = await this.findOne(id);
    this.gymPostRepository.merge(gymPost, updateGymPostDto);
    return this.gymPostRepository.save(gymPost);
  }

  async remove(id: number): Promise<void> {
    const gymPost = await this.findOne(id);
    await this.gymPostRepository.remove(gymPost);
  }

  async findByBodyType(bodyType: string): Promise<GymPost[]> {
    return this.gymPostRepository.find({
      where: { 
        bodyType,
        isActive: true
      },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }
} 