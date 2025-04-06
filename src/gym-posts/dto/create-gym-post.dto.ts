import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGymPostDto {
  @ApiProperty({ example: 'Summer Fitness Challenge', description: 'Title of the gym post' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Join our 30-day summer fitness challenge to transform your body and health!', description: 'Content of the gym post' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: 'https://example.com/images/summer-fitness.jpg', description: 'URL to the post image', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'FULL_BODY', description: 'Target body type for this workout or post', enum: ['FULL_BODY', 'UPPER_BODY', 'LOWER_BODY', 'CORE', 'CARDIO'] })
  @IsNotEmpty()
  @IsString()
  bodyType: string;

  @ApiProperty({ example: 'STRENGTH', description: 'Type of exercise in this post', enum: ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'ENDURANCE'], required: false })
  @IsOptional()
  @IsString()
  exerciseType?: string;
}