import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymController } from './controllers/gym.controller';
import { GymPost } from '../entities/gym-post.entity';
import { Equipment } from '../entities/equipment.entity';
import { GymSchedule } from '../entities/gym-schedule.entity';
import { Attendance } from '../entities/attendance.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GymPost,
      Equipment,
      GymSchedule,
      Attendance,
      User
    ])
  ],
  controllers: [GymController],
  providers: [],
  exports: []
})
export class GymModule {} 