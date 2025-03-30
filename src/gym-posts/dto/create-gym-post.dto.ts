import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGymPostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNotEmpty()
  @IsString()
  bodyType: string;

  @IsOptional()
  @IsString()
  exerciseType?: string;
} 