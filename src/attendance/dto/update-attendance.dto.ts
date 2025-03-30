import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  checkOutTime?: Date;

  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
} 