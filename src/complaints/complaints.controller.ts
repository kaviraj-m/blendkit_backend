import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  Request, 
  ForbiddenException, 
  Query,
  ParseIntPipe,
  Logger
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateComplaintDto, UpdateComplaintStatusDto } from './dto/complaint.dto';
import { ComplaintStatus } from '../entities/complaint.entity';

@Controller('api/complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplaintsController {
  private readonly logger = new Logger(ComplaintsController.name);

  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @Roles('student')
  create(@Request() req, @Body() createComplaintDto: CreateComplaintDto) {
    this.logger.log(`Student ${req.user.id || req.user.userId} creating complaint: ${JSON.stringify(createComplaintDto)}`);
    return this.complaintsService.create(req.user.id || req.user.userId, createComplaintDto);
  }

  @Get()
  async findAll(@Request() req) {
    // Extract role name, handling both string and object formats
    const roleName = typeof req.user.role === 'string' 
      ? req.user.role 
      : (req.user.role?.name || '');
    
    this.logger.log(`User role: ${roleName}, ID: ${req.user.id || req.user.userId} retrieving complaints`);
    
    // If user is a student, only return their complaints based on JWT token ID
    if (roleName === 'student') {
      return this.complaintsService.findByStudent(req.user.id || req.user.userId);
    }
    
    // If user is executive director, return all complaints
    if (roleName === 'executive_director') {
      return this.complaintsService.findAll();
    }
    
    throw new ForbiddenException('Not authorized to view complaints');
  }

  @Get('status/:status')
  @Roles('executive_director')
  findByStatus(@Param('status') status: ComplaintStatus) {
    return this.complaintsService.findByStatus(status);
  }

  @Get(':id')
  async findOne(
    @Request() req, 
    @Param('id', ParseIntPipe) id: number
  ) {
    const complaint = await this.complaintsService.findOne(id);
    
    // Extract role name, handling both string and object formats
    const roleName = typeof req.user.role === 'string' 
      ? req.user.role 
      : (req.user.role?.name || '');
    
    // Students can only view their own complaints, checked by JWT token user ID
    if (roleName === 'student' && complaint.student.id !== (req.user.id || req.user.userId)) {
      throw new ForbiddenException('Not authorized to view this complaint');
    }
    
    return complaint;
  }

  @Patch(':id')
  //@Roles('executive_director')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateComplaintStatusDto,
  ) {
    // Extract role name, handling both string and object formats
    const roleName = typeof req.user.role === 'string' 
      ? req.user.role 
      : (req.user.role?.name || '');
    
    this.logger.log(`User with role ${roleName} attempting to update complaint ${id}`);
    this.logger.log(`Request data: ${JSON.stringify(updateStatusDto)}`);
    
    // Manually check role here for more debugging
    if (roleName !== 'executive_director') {
      this.logger.error(`User with role ${roleName} denied access to update complaint ${id}`);
      throw new ForbiddenException(`Role ${roleName} is not authorized to update complaints. Only executive_director role can update complaints.`);
    }
    
    return this.complaintsService.updateStatus(id, req.user.id || req.user.userId, updateStatusDto);
  }

  @Get('debug/auth')
  @UseGuards(JwtAuthGuard)
  async debugAuth(@Request() req) {
    return {
      userId: req.user.id || req.user.userId,
      email: req.user.email,
      role: req.user.role,
      roleType: typeof req.user.role,
      roleName: typeof req.user.role === 'string' ? req.user.role : (req.user.role?.name || 'unknown'),
      timestamp: new Date().toISOString()
    };
  }
} 