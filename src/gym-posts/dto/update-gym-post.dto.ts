import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateGymPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsString()
  exerciseType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 