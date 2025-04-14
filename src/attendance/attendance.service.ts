import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from '../entities/attendance.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const user = await this.userRepository.findOne({ where: { id: createAttendanceDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createAttendanceDto.userId} not found`);
    }

    const attendance = new Attendance();
    attendance.user = user;
    attendance.isPresent = createAttendanceDto.isPresent ?? true;
    attendance.checkInTime = createAttendanceDto.checkInTime ? new Date(createAttendanceDto.checkInTime) : new Date();
    
    if (createAttendanceDto.notes) {
      attendance.notes = createAttendanceDto.notes;
    }
    
    return this.attendanceRepository.save(attendance);
  }

  async findAll(userId?: number, date?: string, isPresent?: boolean): Promise<Attendance[]> {
    const query = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user');

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.andWhere('attendance.checkInTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (isPresent !== undefined) {
      query.andWhere('attendance.isPresent = :isPresent', { isPresent });
    }

    return query.orderBy('attendance.checkInTime', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    
    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    
    if (updateAttendanceDto.checkOutTime) {
      attendance.checkOutTime = new Date(updateAttendanceDto.checkOutTime);
    }
    
    if (updateAttendanceDto.isPresent !== undefined) {
      attendance.isPresent = updateAttendanceDto.isPresent;
    }
    
    if (updateAttendanceDto.notes) {
      attendance.notes = updateAttendanceDto.notes;
    }

    return this.attendanceRepository.save(attendance);
  }

  async remove(id: number): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async findByUser(userId: number): Promise<Attendance[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.attendanceRepository.find({
      where: { user: { id: userId } },
      order: { checkInTime: 'DESC' },
    });
  }
} 