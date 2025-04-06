import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  Role, 
  User,
  Equipment,
  GymPost,
  GymSchedule,
  College,
  Department,
  DayScholarHosteller,
  Quota,
  Attendance,
  GatePass
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      User,
      Equipment,
      GymPost,
      GymSchedule,
      College,
      Department,
      DayScholarHosteller,
      Quota,
      Attendance,
      GatePass
    ])
  ],
  providers: [],
  exports: []
})
export class SeedModule {} 