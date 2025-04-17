import { IsNotEmpty, IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SocialPostCategory {
  GENERAL = 'general',
  EVENT = 'event',
  ANNOUNCEMENT = 'announcement',
  ACADEMIC = 'academic',
  QUESTION = 'question',
  OTHER = 'other'
}

export enum SocialPostVisibility {
  PUBLIC = 'public',
  DEPARTMENT = 'department',
  BATCH = 'batch'
}

export class CreateSocialPostDto {
  @ApiProperty({ 
    example: 'Looking for study partners for the upcoming exams!', 
    description: 'Content of the social post' 
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ 
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], 
    description: 'Array of media URLs',
    required: false
  })
  @IsOptional()
  @IsArray()
  mediaUrls?: string[];

  @ApiProperty({ 
    example: 'academic', 
    description: 'Category of the post',
    enum: SocialPostCategory,
    required: false
  })
  @IsOptional()
  @IsEnum(SocialPostCategory)
  category?: SocialPostCategory;

  @ApiProperty({ 
    example: 'public', 
    description: 'Visibility of the post',
    enum: SocialPostVisibility,
    default: SocialPostVisibility.PUBLIC
  })
  @IsOptional()
  @IsEnum(SocialPostVisibility)
  visibility?: SocialPostVisibility = SocialPostVisibility.PUBLIC;
} 