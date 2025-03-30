import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymScheduleService } from './gym-schedule.service';
import { GymScheduleController } from './gym-schedule.controller';
import { GymSchedule } from '../entities/gym-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GymSchedule])],
  controllers: [GymScheduleController],
  providers: [GymScheduleService],
  exports: [GymScheduleService],
})
export class GymScheduleModule {} 