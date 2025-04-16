import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatePassController } from './gate-pass.controller';
import { GatePassService } from './gate-pass.service';
import { GatePass, User, Department } from '../entities';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GatePass, User, Department]),
    EmailModule,
  ],
  controllers: [GatePassController],
  providers: [GatePassService],
  exports: [GatePassService]
})
export class GatePassModule {} 