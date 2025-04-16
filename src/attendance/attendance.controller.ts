import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create attendance record (check-in)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Attendance record created successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff', 'student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all attendance records with optional filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all attendance records' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findAll(
    @Query('userId') userId?: number,
    @Query('date') date?: string,
    @Query('isPresent') isPresent?: boolean,
  ) {
    return this.attendanceService.findAll(userId, date, isPresent);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff', 'student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance record by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return attendance record by id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Attendance record not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update attendance record (check-out)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Attendance record updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Attendance record not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(+id, updateAttendanceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete attendance record' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Attendance record deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Attendance record not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff', 'student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance history for a specific user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return attendance history' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findByUser(@Param('userId') userId: string) {
    return this.attendanceService.findByUser(+userId);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return attendance statistics' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getStatistics(startDate, endDate);
  }

  @Get('today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance records for today' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return today\'s attendance records' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  getTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceService.findAll(undefined, today);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('gym_staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance records for users currently in the gym' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return current attendance records' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  getCurrentAttendance() {
    return this.attendanceService.findAll(undefined, undefined, true);
  }
} 