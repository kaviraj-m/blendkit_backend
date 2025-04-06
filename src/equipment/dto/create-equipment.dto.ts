import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Dumbbell Set', description: 'Name of the equipment' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Set of adjustable dumbbells ranging from 5kg to 30kg', description: 'Detailed description of the equipment' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 10, description: 'Number of this equipment available in the gym', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'https://example.com/images/dumbbell-set.jpg', description: 'URL to the equipment image', required: false })
  @IsOptional()
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: 'Weights', description: 'Category of the equipment', enum: ['Weights', 'Cardio', 'Machines', 'Accessories'], required: false })
  @IsOptional()
  @IsString()
  category: string;

  @ApiProperty({ example: 'Strength', description: 'Type of training this equipment is used for', enum: ['Strength', 'Cardio', 'Flexibility', 'Balance'], required: false })
  @IsOptional()
  @IsString()
  trainingType: string;

  @ApiProperty({ example: 'Weight Room - Section A', description: 'Location of the equipment in the gym', required: false })
  @IsOptional()
  @IsString()
  location: string;
}