import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateGymScheduleDto {
  @IsNotEmpty()
  @IsString()
  day: string;

  @IsNotEmpty()
  @IsString()
  openingTime: string;

  @IsNotEmpty()
  @IsString()
  closingTime: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  specialNote?: string;
} 