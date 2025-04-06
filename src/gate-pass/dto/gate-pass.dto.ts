import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { GatePassType } from '../../entities/gate-pass.entity';

export class CreateGatePassDto {
  @IsEnum(GatePassType)
  @IsNotEmpty()
  type: GatePassType;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}

export class UpdateGatePassStatusByStaffDto {
  @IsString()
  @IsNotEmpty()
  status: 'approved_by_staff' | 'rejected_by_staff';

  @IsString()
  @IsOptional()
  staff_comment?: string;
}

export class UpdateGatePassStatusByHodDto {
  @IsString()
  @IsNotEmpty()
  status: 'approved_by_hod' | 'rejected_by_hod';

  @IsString()
  @IsOptional()
  hod_comment?: string;
}

export class UpdateGatePassStatusByAcademicDirectorDto {
  @IsString()
  @IsNotEmpty()
  status: 'approved' | 'rejected_by_academic_director';

  @IsString()
  @IsOptional()
  academic_director_comment?: string;
}

export class UpdateGatePassBySecurityDto {
  @IsString()
  @IsNotEmpty()
  status: 'used';

  @IsString()
  @IsOptional()
  security_comment?: string;
}

export class GatePassFilterDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  student_id?: number;

  @IsNumber()
  @IsOptional()
  department_id?: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
} 