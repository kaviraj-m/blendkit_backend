import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGymScheduleDto } from './dto/create-gym-schedule.dto';
import { UpdateGymScheduleDto } from './dto/update-gym-schedule.dto';
import { GymSchedule } from '../entities/gym-schedule.entity';

@Injectable()
export class GymScheduleService {
  constructor(
    @InjectRepository(GymSchedule)
    private gymScheduleRepository: Repository<GymSchedule>,
  ) {}

  async create(createGymScheduleDto: CreateGymScheduleDto): Promise<GymSchedule> {
    const gymSchedule = this.gymScheduleRepository.create(createGymScheduleDto);
    return this.gymScheduleRepository.save(gymSchedule);
  }

  async findAll(): Promise<GymSchedule[]> {
    return this.gymScheduleRepository.find({
      order: {
        // Order by day of week (Sunday = 0, Monday = 1, etc.)
        day: 'ASC',
      },
    });
  }

  async findActive(): Promise<GymSchedule[]> {
    return this.gymScheduleRepository.find({
      where: { isActive: true },
      order: {
        day: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<GymSchedule> {
    const gymSchedule = await this.gymScheduleRepository.findOne({ where: { id } });
    if (!gymSchedule) {
      throw new NotFoundException(`Gym schedule with ID ${id} not found`);
    }
    return gymSchedule;
  }

  async update(id: number, updateGymScheduleDto: UpdateGymScheduleDto): Promise<GymSchedule> {
    const gymSchedule = await this.findOne(id);
    this.gymScheduleRepository.merge(gymSchedule, updateGymScheduleDto);
    return this.gymScheduleRepository.save(gymSchedule);
  }

  async remove(id: number): Promise<void> {
    const gymSchedule = await this.findOne(id);
    await this.gymScheduleRepository.remove(gymSchedule);
  }
} 