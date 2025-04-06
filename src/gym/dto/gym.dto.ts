import { IsString, IsNumber, IsEnum, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BodyType {
  LEAN = 'lean',
  ATHLETIC = 'athletic',
  MUSCULAR = 'muscular',
  AVERAGE = 'average',
  OTHER = 'other'
}

export enum ExerciseType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  SPORTS = 'sports'
}

export class CreateGymPostDto {
  @ApiProperty({ 
    description: 'Title of the gym post',
    example: 'Best Chest Workouts for Beginners'
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'Content of the gym post',
    example: 'This workout focuses on building chest muscles using simple exercises that are perfect for beginners. Start with push-ups, then move to dumbbell presses.'
  })
  @IsString()
  content: string;

  @ApiProperty({ 
    description: 'Target body type', 
    enum: BodyType,
    example: BodyType.LEAN
  })
  @IsEnum(BodyType)
  bodyType: BodyType;

  @ApiProperty({ 
    description: 'Type of exercise', 
    enum: ExerciseType,
    example: ExerciseType.STRENGTH
  })
  @IsEnum(ExerciseType)
  exerciseType: ExerciseType;
}

export class UpdateGymPostDto {
  @ApiProperty({ 
    description: 'Title of the gym post', 
    required: false,
    example: 'Updated: Best Chest Workouts for Beginners'
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ 
    description: 'Content of the gym post', 
    required: false,
    example: 'Updated content with new exercise recommendations and tips for better form.'
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ 
    description: 'Target body type', 
    enum: BodyType, 
    required: false,
    example: BodyType.ATHLETIC
  })
  @IsEnum(BodyType)
  @IsOptional()
  bodyType?: BodyType;

  @ApiProperty({ 
    description: 'Type of exercise', 
    enum: ExerciseType, 
    required: false,
    example: ExerciseType.STRENGTH
  })
  @IsEnum(ExerciseType)
  @IsOptional()
  exerciseType?: ExerciseType;
}

export class CreateEquipmentDto {
  @ApiProperty({ 
    description: 'Name of the equipment',
    example: 'Dumbbell Set' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Description of the equipment',
    example: 'Set of 5 pairs ranging from 5kg to 25kg'
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Quantity of equipment available',
    example: 5
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({ 
    description: 'Location of the equipment in the gym',
    example: 'Weight Section, Rack 3'
  })
  @IsString()
  location: string;

  @ApiProperty({ 
    description: 'Whether the equipment is available',
    example: true
  })
  @IsBoolean()
  isAvailable: boolean;
}

export class UpdateEquipmentDto {
  @ApiProperty({ 
    description: 'Name of the equipment', 
    required: false,
    example: 'Heavy Dumbbell Set'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'Description of the equipment', 
    required: false,
    example: 'Professional grade dumbbells with rubber coating'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Quantity of equipment available', 
    required: false,
    example: 10
  })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ 
    description: 'Location of the equipment in the gym', 
    required: false,
    example: 'Weight Section, Rack 2'
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ 
    description: 'Whether the equipment is available', 
    required: false,
    example: false
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class CreateGymScheduleDto {
  @ApiProperty({ 
    description: 'Day of the week (0-6, where 0 is Sunday)',
    example: 1
  })
  @IsNumber()
  day: number;

  @ApiProperty({ 
    description: 'Opening time in HH:mm format',
    example: '06:00'
  })
  @IsString()
  openingTime: string;

  @ApiProperty({ 
    description: 'Closing time in HH:mm format',
    example: '22:00'
  })
  @IsString()
  closingTime: string;
}

export class UpdateGymScheduleDto {
  @ApiProperty({ 
    description: 'Opening time in HH:mm format', 
    required: false,
    example: '05:30'
  })
  @IsString()
  @IsOptional()
  openingTime?: string;

  @ApiProperty({ 
    description: 'Closing time in HH:mm format', 
    required: false,
    example: '21:30'
  })
  @IsString()
  @IsOptional()
  closingTime?: string;
}

export class CreateAttendanceDto {
  @ApiProperty({ 
    description: 'User ID',
    example: 1
  })
  @IsNumber()
  userId: number;

  @ApiProperty({ 
    description: 'Check-in time',
    example: new Date()
  })
  @IsDate()
  checkIn: Date;

  @ApiProperty({ 
    description: 'Check-out time', 
    required: false,
    example: null
  })
  @IsDate()
  @IsOptional()
  checkOut?: Date;
}

export class UpdateAttendanceDto {
  @ApiProperty({ 
    description: 'Check-out time',
    example: new Date()
  })
  @IsDate()
  checkOut: Date;
}