import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Quota } from './entities/quota.entity';
import { DayScholarHosteller } from './entities/day-scholar-hosteller.entity';
import { College } from './entities/college.entity';
import { Department } from './entities/department.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Quota)
    private readonly quotasRepository: Repository<Quota>,
    @InjectRepository(DayScholarHosteller)
    private readonly dayScholarHostellerRepository: Repository<DayScholarHosteller>,
    @InjectRepository(College)
    private readonly collegesRepository: Repository<College>,
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
    private readonly redisService: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: createUserDto.email } 
    });
    
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Check if SIN number is already in use if provided
    if (createUserDto.sin_number) {
      const existingUserWithSIN = await this.usersRepository.findOne({ 
        where: { sin_number: createUserDto.sin_number } 
      });
      
      if (existingUserWithSIN) {
        throw new ConflictException('SIN number already in use');
      }
    }

    // Verify foreign keys exist
    await this.verifyForeignKeys(createUserDto);

    // Create new user
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    
    // Cache user in Redis
    await this.redisService.set(`user:${savedUser.id}`, this.sanitizeUser(savedUser), 3600); // 1 hour TTL
    
    return this.sanitizeUser(savedUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: ['role', 'quota', 'department', 'college', 'dayScholarHosteller'],
    });
    return users.map(user => this.sanitizeUser(user));
  }

  async findOne(id: number): Promise<User> {
    // Try to get from cache first
    const cachedUser = await this.redisService.get(`user:${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['role', 'quota', 'department', 'college', 'dayScholarHosteller'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Cache for future requests
    const sanitizedUser = this.sanitizeUser(user);
    await this.redisService.set(`user:${id}`, sanitizedUser, 3600);
    
    return sanitizedUser;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { email },
      relations: ['role'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    return user; // Not sanitized for auth purposes
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify foreign keys if they are being updated
    if (Object.keys(updateUserDto).some(key => 
      ['role_id', 'quota_id', 'department_id', 'college_id', 'dayscholar_hosteller_id'].includes(key)
    )) {
      await this.verifyForeignKeys(updateUserDto);
    }

    // Update user
    await this.usersRepository.update(id, updateUserDto);
    
    // Get the updated user
    const updatedUser = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['role', 'quota', 'department', 'college', 'dayScholarHosteller'],
    });
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }
    
    // Update cache
    const sanitizedUser = this.sanitizeUser(updatedUser);
    await this.redisService.set(`user:${id}`, sanitizedUser, 3600);
    
    return sanitizedUser;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Remove from cache
    await this.redisService.del(`user:${id}`);
  }

  // Helper methods
  private sanitizeUser(user: User): User {
    const { password, ...sanitized } = user;
    return sanitized as User;
  }

  private async verifyForeignKeys(dto: any): Promise<void> {
    // Verify role exists
    if (dto.role_id) {
      const role = await this.rolesRepository.findOne({ where: { id: dto.role_id } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${dto.role_id} not found`);
      }
    }

    // Verify quota exists
    if (dto.quota_id) {
      const quota = await this.quotasRepository.findOne({ where: { id: dto.quota_id } });
      if (!quota) {
        throw new NotFoundException(`Quota with ID ${dto.quota_id} not found`);
      }
    }

    // Verify department exists
    if (dto.department_id) {
      const department = await this.departmentsRepository.findOne({ where: { id: dto.department_id } });
      if (!department) {
        throw new NotFoundException(`Department with ID ${dto.department_id} not found`);
      }
    }

    // Verify college exists
    if (dto.college_id) {
      const college = await this.collegesRepository.findOne({ where: { id: dto.college_id } });
      if (!college) {
        throw new NotFoundException(`College with ID ${dto.college_id} not found`);
      }
    }

    // Verify day scholar or hosteller exists
    if (dto.dayscholar_hosteller_id) {
      const dayScholarHosteller = await this.dayScholarHostellerRepository.findOne({ 
        where: { id: dto.dayscholar_hosteller_id } 
      });
      if (!dayScholarHosteller) {
        throw new NotFoundException(`Day Scholar/Hosteller with ID ${dto.dayscholar_hosteller_id} not found`);
      }
    }
  }
}
