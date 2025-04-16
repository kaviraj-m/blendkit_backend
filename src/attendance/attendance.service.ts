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
    
    if (createAttendanceDto.workoutType) {
      attendance.workoutType = createAttendanceDto.workoutType;
    }
    
    if (createAttendanceDto.plannedDuration) {
      attendance.plannedDuration = createAttendanceDto.plannedDuration;
    }
    
    if (createAttendanceDto.isFirstVisit !== undefined) {
      attendance.isFirstVisit = createAttendanceDto.isFirstVisit;
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
      
      if (attendance.checkInTime) {
        const durationMs = attendance.checkOutTime.getTime() - attendance.checkInTime.getTime();
        attendance.actualDuration = Math.round(durationMs / (1000 * 60));
      }
    }
    
    if (updateAttendanceDto.isPresent !== undefined) {
      attendance.isPresent = updateAttendanceDto.isPresent;
    }
    
    if (updateAttendanceDto.notes) {
      attendance.notes = updateAttendanceDto.notes;
    }
    
    if (updateAttendanceDto.workoutType) {
      attendance.workoutType = updateAttendanceDto.workoutType;
    }
    
    if (updateAttendanceDto.actualDuration) {
      attendance.actualDuration = updateAttendanceDto.actualDuration;
    }
    
    if (updateAttendanceDto.completionStatus) {
      attendance.completionStatus = updateAttendanceDto.completionStatus;
    }
    
    if (updateAttendanceDto.staffObservations) {
      attendance.staffObservations = updateAttendanceDto.staffObservations;
    }
    
    if (updateAttendanceDto.workoutIntensity) {
      attendance.workoutIntensity = updateAttendanceDto.workoutIntensity;
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

  async getStatistics(startDate?: string, endDate?: string): Promise<any> {
    const query = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user');
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.andWhere('attendance.checkInTime >= :start', { start });
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('attendance.checkInTime <= :end', { end });
    }
    
    const records = await query.getMany();
    
    const totalVisits = records.length;
    const uniqueUsers = new Set(records.map(r => r.user.id)).size;
    
    const recordsWithDuration = records.filter(r => r.actualDuration);
    const averageDuration = recordsWithDuration.length > 0 
      ? recordsWithDuration.reduce((sum, r) => sum + r.actualDuration, 0) / recordsWithDuration.length 
      : 0;
    
    const workoutTypes = records
      .filter(r => r.workoutType)
      .reduce((acc, r) => {
        acc[r.workoutType] = (acc[r.workoutType] || 0) + 1;
        return acc;
      }, {});
    
    const hourCounts = {};
    records.forEach(r => {
      const hour = new Date(r.checkInTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    let peakHour = 0;
    let peakCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      const countValue = count as number;
      if (countValue > peakCount) {
        peakHour = parseInt(hour);
        peakCount = countValue;
      }
    });
    
    return {
      totalVisits,
      uniqueUsers,
      averageDuration,
      workoutTypes,
      peakHour,
      hourDistribution: hourCounts
    };
  }
} 