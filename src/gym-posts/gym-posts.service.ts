import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGymPostDto } from './dto/create-gym-post.dto';
import { UpdateGymPostDto } from './dto/update-gym-post.dto';
import { GymPost } from '../entities/gym-post.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class GymPostsService {
  constructor(
    @InjectRepository(GymPost)
    private gymPostRepository: Repository<GymPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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

    return query.orderBy('gymPost.createdAt', 'DESC').getMany();
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