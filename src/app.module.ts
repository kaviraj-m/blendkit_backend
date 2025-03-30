import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './common/redis/redis.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EquipmentModule } from './equipment/equipment.module';
import { AttendanceModule } from './attendance/attendance.module';
import { GymPostsModule } from './gym-posts/gym-posts.module';
import { GymScheduleModule } from './gym-schedule/gym-schedule.module';

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
        synchronize: false, // Set to false to prevent automatic schema changes
      }),
    }),
    RedisModule,
    UsersModule,
    AuthModule,
    EquipmentModule,
    AttendanceModule,
    GymPostsModule,
    GymScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
