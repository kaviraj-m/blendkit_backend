import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { GymScheduleService } from './gym-schedule.service';
import { CreateGymScheduleDto } from './dto/create-gym-schedule.dto';
import { UpdateGymScheduleDto } from './dto/update-gym-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('gym-schedule')
@Controller('gym-schedule')
export class GymScheduleController {
  constructor(private readonly gymScheduleService: GymScheduleService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new gym schedule' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Gym schedule created successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  create(@Body() createGymScheduleDto: CreateGymScheduleDto) {
    return this.gymScheduleService.create(createGymScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all gym schedules' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all gym schedules' })
  findAll() {
    return this.gymScheduleService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active gym schedules' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return active gym schedules' })
  findActive() {
    return this.gymScheduleService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gym schedule by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return gym schedule by id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Gym schedule not found' })
  findOne(@Param('id') id: string) {
    return this.gymScheduleService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update gym schedule' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Gym schedule updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Gym schedule not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  update(@Param('id') id: string, @Body() updateGymScheduleDto: UpdateGymScheduleDto) {
    return this.gymScheduleService.update(+id, updateGymScheduleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete gym schedule' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Gym schedule deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Gym schedule not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  remove(@Param('id') id: string) {
    return this.gymScheduleService.remove(+id);
  }
} 