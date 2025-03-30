import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateGymScheduleDto {
  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsString()
  openingTime?: string;

  @IsOptional()
  @IsString()
  closingTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  specialNote?: string;
} 