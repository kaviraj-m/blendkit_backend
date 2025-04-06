import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './common/redis/redis.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EquipmentModule } from './equipment/equipment.module';
import { AttendanceModule } from './attendance/attendance.module';
import { GymPostsModule } from './gym-posts/gym-posts.module';
import { GymScheduleModule } from './gym-schedule/gym-schedule.module';
import { GymModule } from './gym/gym.module';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { Equipment } from './entities/equipment.entity';
import { User } from './entities/user.entity';
import { GymPost } from './entities/gym-post.entity';
import { GymSchedule } from './entities/gym-schedule.entity';
import { Complaint } from './entities/complaint.entity';
import { ComplaintsModule } from './complaints/complaints.module';
import { GatePassModule } from './gate-pass/gate-pass.module';
import { 
  Role, 
  College, 
  Department, 
  DayScholarHosteller, 
  Quota, 
  GatePass
} from './entities';
import { SeedModule } from './database/seeds/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
        migrationsRun: false,
        dropSchema: false,
        extra: {
          max: 30,
          connectionTimeoutMillis: 10000,
        }
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Equipment,
      User,
      GymPost,
      GymSchedule,
      Complaint,
      GatePass
    ]),
    RedisModule,
    UsersModule,
    AuthModule,
    EquipmentModule,
    AttendanceModule,
    GymPostsModule,
    GymScheduleModule,
    GymModule,
    SeedModule,
    ComplaintsModule,
    GatePassModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule {}
