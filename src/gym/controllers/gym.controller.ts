import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../entities/role.entity';
import { 
  CreateGymPostDto, 
  UpdateGymPostDto,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  CreateGymScheduleDto,
  UpdateGymScheduleDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BodyType,
  ExerciseType
} from '../dto/gym.dto';

@ApiTags('Gym Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gym')
export class GymController {
  // Gym Posts
  @Get('posts')
  @ApiOperation({ summary: 'Get all gym posts', description: 'Retrieves all gym posts with optional filtering by body type and exercise type' })
  @ApiQuery({ name: 'bodyType', enum: BodyType, required: false, description: 'Filter posts by body type' })
  @ApiQuery({ name: 'exerciseType', enum: ExerciseType, required: false, description: 'Filter posts by exercise type' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all gym posts',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          title: { type: 'string', example: 'Best Chest Workouts for Beginners' },
          content: { type: 'string', example: 'This workout focuses on building chest muscles...' },
          bodyType: { type: 'string', example: 'lean' },
          exerciseType: { type: 'string', example: 'strength' },
          createdAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' },
          createdBy: { 
            type: 'object', 
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'John Doe' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllPosts(
    @Query('bodyType') bodyType?: BodyType,
    @Query('exerciseType') exerciseType?: ExerciseType
  ) {
    // Implementation
  }

  @Post('posts')
  @Roles('gym_staff')
  @ApiOperation({ summary: 'Create a new gym post', description: 'Create a new workout post (Gym Staff only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Post created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Best Chest Workouts for Beginners' },
        content: { type: 'string', example: 'This workout focuses on building chest muscles...' },
        bodyType: { type: 'string', example: 'lean' },
        exerciseType: { type: 'string', example: 'strength' },
        createdAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a gym staff member' })
  async createPost(@Body() createGymPostDto: CreateGymPostDto) {
    // Implementation
  }

  @Patch('posts/:id')
  @Roles('gym_staff')
  @ApiOperation({ summary: 'Update a gym post', description: 'Update an existing gym post (Gym Staff only)' })
  @ApiParam({ name: 'id', description: 'Post ID', example: '1' })
  @ApiResponse({ 
    status: 200, 
    description: 'Post updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Updated: Best Chest Workouts for Beginners' },
        content: { type: 'string', example: 'Updated content with new exercise recommendations...' },
        bodyType: { type: 'string', example: 'athletic' },
        exerciseType: { type: 'string', example: 'strength' },
        updatedAt: { type: 'string', format: 'date-time', example: '2023-04-03T14:30:00Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a gym staff member' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(@Param('id') id: string, @Body() updateGymPostDto: UpdateGymPostDto) {
    // Implementation
  }

  @Delete('posts/:id')
  @Roles('gym_staff')
  @ApiOperation({ summary: 'Delete a gym post', description: 'Delete an existing gym post (Gym Staff only)' })
  @ApiParam({ name: 'id', description: 'Post ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a gym staff member' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(@Param('id') id: string) {
    // Implementation
  }

  // Equipment
  @Get('equipment')
  @ApiOperation({ summary: 'Get all gym equipment', description: 'Retrieves all gym equipment items' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all gym equipment',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Dumbbell Set' },
          description: { type: 'string', example: 'Set of 5 pairs ranging from 5kg to 25kg' },
          quantity: { type: 'number', example: 5 },
          location: { type: 'string', example: 'Weight Section, Rack 3' },
          isAvailable: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllEquipment() {
    // Implementation
  }

  @Post('equipment')
  @Roles('gym_staff')
  @ApiOperation({ summary: 'Add new gym equipment', description: 'Add new equipment to the gym inventory (Gym Staff only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Equipment added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Dumbbell Set' },
        description: { type: 'string', example: 'Set of 5 pairs ranging from 5kg to 25kg' },
        quantity: { type: 'number', example: 5 },
        location: { type: 'string', example: 'Weight Section, Rack 3' },
        isAvailable: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a gym staff member' })
  async addEquipment(@Body() createEquipmentDto: CreateEquipmentDto) {
    // Implementation
  }

  @Patch('equipment/:id')
  @Roles('gym_staff')
  @ApiOperation({ summary: 'Update gym equipment', description: 'Update existing gym equipment (Gym Staff only)' })
  @ApiParam({ name: 'id', description: 'Equipment ID', example: '1' })
  @ApiResponse({ 
    status: 200, 
    description: 'Equipment updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Heavy Dumbbell Set' },
        description: { type: 'string', example: 'Professional grade dumbbells with rubber coating' },
        quantity: { type: 'number', example: 10 },
        location: { type: 'string', example: 'Weight Section, Rack 2' },
        isAvailable: { type: 'boolean', example: false },
        updatedAt: { type: 'string', format: 'date-time', example: '2023-04-03T14:30:00Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a gym staff member' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  async updateEquipment(@Param('id') id: string, @Body() updateEquipmentDto: UpdateEquipmentDto) {
    // Implementation
  }

  // Gym Schedule
  @Get('schedule')
  @ApiOperation({ summary: 'Get gym schedule', description: 'Retrieves the weekly gym schedule' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns gym schedule',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          day: { type: 'number', example: 1, description: 'Day of week (0-6, where 0 is Sunday)' },
          openingTime: { type: 'string', example: '06:00' },
          closingTime: { type: 'string', example: '22:00' },
          createdAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSchedule() {
    // Implementation
  }

  @Post('schedule')
  @Roles('gym_staff')
  @ApiOperation({ summary: 'Create gym schedule', description: 'Create a new gym schedule entry (Gym Staff only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Schedule created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        day: { type: 'number', example: 1, description: 'Day of week (0-6, where 0 is Sunday)' },
        openingTime: { type: 'string', example: '06:00' },
        closingTime: { type: 'string', example: '22:00' },
        createdAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2023-04-02T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a gym staff member' })
  async createSchedule(@Body() createGymScheduleDto: CreateGymScheduleDto) {
    // Implementation
  }

  @Patch('schedule/:id')
  @Roles('gym_staff')
  @ApiOperation({ summary: 'Update gym schedule', description: 'Update an existing gym schedule entry (Gym Staff only)' })
  @ApiParam({ name: 'id', description: 'Schedule ID', example: '1' })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedule updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        day: { type: 'number', example: 1, description: 'Day of week (0-6, where 0 is Sunday)' },
        openingTime: { type: 'string', example: '05:30' },
        closingTime: { type: 'string', example: '21:30' },
        updatedAt: { type: 'string', format: 'date-time', example: '2023-04-03T14:30:00Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a gym staff member' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async updateSchedule(@Param('id') id: string, @Body() updateGymScheduleDto: UpdateGymScheduleDto) {
    // Implementation
  }

  // Attendance
  @Get('attendance')
  @ApiOperation({ summary: 'Get gym attendance records', description: 'Retrieves all gym attendance records with optional filtering' })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'Filter by user ID' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Filter by date (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns attendance records',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          userId: { type: 'number', example: 1 },
          user: { 
            type: 'object', 
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john.doe@example.com' }
            }
          },
          checkIn: { type: 'string', format: 'date-time', example: '2023-04-02T08:30:00Z' },
          checkOut: { type: 'string', format: 'date-time', example: '2023-04-02T10:15:00Z' },
          createdAt: { type: 'string', format: 'date-time', example: '2023-04-02T08:30:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2023-04-02T10:15:00Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAttendance(
    @Query('userId') userId?: number,
    @Query('date') date?: string
  ) {
    // Implementation
  }

  @Post('attendance/check-in')
  @ApiOperation({ summary: 'Check in to gym', description: 'Record a user check-in to the gym' })
  @ApiResponse({ 
    status: 201, 
    description: 'Check-in successful',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        userId: { type: 'number', example: 1 },
        checkIn: { type: 'string', format: 'date-time', example: '2023-04-02T08:30:00Z' },
        createdAt: { type: 'string', format: 'date-time', example: '2023-04-02T08:30:00Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - User already checked in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkIn(@Body() createAttendanceDto: CreateAttendanceDto) {
    // Implementation
  }

  @Post('attendance/check-out')
  @ApiOperation({ summary: 'Check out from gym', description: 'Record a user check-out from the gym' })
  @ApiResponse({ 
    status: 200, 
    description: 'Check-out successful',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        userId: { type: 'number', example: 1 },
        checkIn: { type: 'string', format: 'date-time', example: '2023-04-02T08:30:00Z' },
        checkOut: { type: 'string', format: 'date-time', example: '2023-04-02T10:15:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2023-04-02T10:15:00Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - No active check-in found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkOut(@Body() updateAttendanceDto: UpdateAttendanceDto) {
    // Implementation
  }

  @Get('attendance/user/:userId')
  @ApiOperation({ summary: 'Get user attendance history', description: 'Retrieves attendance history for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns user attendance history',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          checkIn: { type: 'string', format: 'date-time', example: '2023-04-02T08:30:00Z' },
          checkOut: { type: 'string', format: 'date-time', example: '2023-04-02T10:15:00Z' },
          duration: { type: 'number', example: 105, description: 'Duration in minutes' },
          date: { type: 'string', format: 'date', example: '2023-04-02' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserAttendance(@Param('userId') userId: string) {
    // Implementation
  }
}