import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
} 