import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGymPostDto {
  @ApiProperty({ example: 'Updated Summer Fitness Challenge', description: 'Updated title of the gym post', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Join our updated 30-day summer fitness challenge with new exercises!', description: 'Updated content of the gym post', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: 'https://example.com/images/updated-fitness.jpg', description: 'Updated URL to the post image', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'UPPER_BODY', description: 'Updated target body type for this workout or post', enum: ['FULL_BODY', 'UPPER_BODY', 'LOWER_BODY', 'CORE', 'CARDIO'], required: false })
  @IsOptional()
  @IsString()
  bodyType?: string;

  @ApiProperty({ example: 'FLEXIBILITY', description: 'Updated type of exercise in this post', enum: ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'ENDURANCE'], required: false })
  @IsOptional()
  @IsString()
  exerciseType?: string;

  @ApiProperty({ example: true, description: 'Whether the post is active and visible to users', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}