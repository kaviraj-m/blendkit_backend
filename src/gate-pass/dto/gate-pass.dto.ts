import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { GatePassType, RequesterType } from '../../entities/gate-pass.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGatePassDto {
  @ApiProperty({ enum: GatePassType, example: GatePassType.LEAVE })
  @IsEnum(GatePassType)
  @IsNotEmpty()
  type: GatePassType;

  @ApiProperty({ example: 'Medical appointment' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ example: 'Need to visit doctor for routine checkup', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-05-01T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: '2025-05-01T18:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;
  
  @ApiProperty({ enum: RequesterType, example: RequesterType.STUDENT, required: false })
  @IsEnum(RequesterType)
  @IsOptional()
  requester_type?: RequesterType;
}

export class CreateStaffGatePassDto extends CreateGatePassDto {
  @ApiProperty({ enum: RequesterType, default: RequesterType.STAFF })
  @IsEnum(RequesterType)
  @IsNotEmpty()
  requester_type: RequesterType = RequesterType.STAFF;
}

export class CreateHodGatePassDto extends CreateGatePassDto {
  @ApiProperty({ enum: RequesterType, default: RequesterType.HOD })
  @IsEnum(RequesterType)
  @IsNotEmpty()
  requester_type: RequesterType = RequesterType.HOD;
}

export class UpdateGatePassStatusByStaffDto {
  @ApiProperty({ enum: ['approved_by_staff', 'rejected_by_staff'] })
  @IsString()
  @IsNotEmpty()
  status: 'approved_by_staff' | 'rejected_by_staff';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  staff_comment?: string;
}

export class UpdateGatePassStatusByHodDto {
  @ApiProperty({ enum: ['approved_by_hod', 'rejected_by_hod'] })
  @IsString()
  @IsNotEmpty()
  status: 'approved_by_hod' | 'rejected_by_hod';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  hod_comment?: string;
}

export class UpdateGatePassStatusByAcademicDirectorDto {
  @ApiProperty({ enum: ['approved', 'rejected_by_academic_director'] })
  @IsString()
  @IsNotEmpty()
  status: 'approved' | 'rejected_by_academic_director';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  academic_director_comment?: string;
}

export class UpdateGatePassBySecurityDto {
  @ApiProperty({ enum: ['used'] })
  @IsString()
  @IsNotEmpty()
  status: 'used';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  security_comment?: string;
}

export class UpdateGatePassStatusByHostelWardenDto {
  @ApiProperty({ enum: ['approved_by_hostel_warden', 'rejected_by_hostel_warden'] })
  @IsString()
  @IsNotEmpty()
  status: 'approved_by_hostel_warden' | 'rejected_by_hostel_warden';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  hostel_warden_comment?: string;
}

export class GatePassFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  student_id?: number;
  
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  requester_id?: number;
  
  @ApiProperty({ enum: RequesterType, required: false })
  @IsEnum(RequesterType)
  @IsOptional()
  requester_type?: RequesterType;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  department_id?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string;
} 