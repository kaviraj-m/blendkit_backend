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
    
    // If user is executive director or academic director, return all complaints
    if (roleName === 'executive_director' || roleName === 'academic_director') {
      return this.complaintsService.findAll();
    }
    
    throw new ForbiddenException('Not authorized to view complaints');
  }

  @Get('department')
  @Roles('hod')
  async findDepartmentComplaints(@Request() req) {
    this.logger.log(`HOD ${req.user.id || req.user.userId} retrieving department complaints`);
    
    // Get the HOD's department ID from the user object
    const departmentId = req.user.department_id;
    
    if (!departmentId) {
      this.logger.error(`HOD ${req.user.id || req.user.userId} has no associated department`);
      throw new ForbiddenException('HOD must have an associated department');
    }
    
    return this.complaintsService.findByDepartment(departmentId);
  }

  @Get('hostel')
  @Roles('warden')
  async findHostelComplaints(@Request() req) {
    this.logger.log(`Warden ${req.user.id || req.user.userId} retrieving hostel complaints`);
    
    // Assuming the warden is associated with a hostel through the user profile
    // We may need to adapt this based on your actual data model
    const wardenId = req.user.id || req.user.userId;
    
    if (!wardenId) {
      this.logger.error(`Invalid warden ID`);
      throw new ForbiddenException('Valid warden ID is required');
    }
    
    return this.complaintsService.findByHostel(wardenId);
  }

  @Get('status/:status')
  @Roles('executive_director', 'academic_director')
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
    
    // HODs can only view complaints from their department
    if (roleName === 'hod' && complaint.student.department_id !== req.user.department_id) {
      throw new ForbiddenException('You can only view complaints from students in your department');
    }
    
    // For wardens, add appropriate permission check here
    // This would depend on your data model for wardens/hostels
    
    return complaint;
  }

  @Patch(':id')
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
    
    // Allow HODs, wardens, academic directors and executive directors to update complaints
    const allowedRoles = ['executive_director', 'academic_director', 'hod', 'warden'];
    if (!allowedRoles.includes(roleName)) {
      this.logger.error(`User with role ${roleName} denied access to update complaint ${id}`);
      throw new ForbiddenException(`Role ${roleName} is not authorized to update complaints. Only specific roles can update complaints.`);
    }
    
    // If HOD, validate that the complaint belongs to their department
    if (roleName === 'hod') {
      const complaint = await this.complaintsService.findOne(id);
      if (complaint.student.department_id !== req.user.department_id) {
        this.logger.error(`HOD from department ${req.user.department_id} attempted to update complaint from department ${complaint.student.department_id}`);
        throw new ForbiddenException('You can only update complaints from students in your department');
      }
    }
    
    // If warden, validate that the complaint belongs to their hostel
    // This check would depend on your data model
    
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
      department: req.user.department_id ? req.user.department_id : 'none',
      timestamp: new Date().toISOString()
    };
  }
} 