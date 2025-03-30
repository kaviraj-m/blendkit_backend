import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Quota } from './entities/quota.entity';
import { DayScholarHosteller } from './entities/day-scholar-hosteller.entity';
import { College } from './entities/college.entity';
import { Department } from './entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Quota,
      DayScholarHosteller,
      College,
      Department,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
