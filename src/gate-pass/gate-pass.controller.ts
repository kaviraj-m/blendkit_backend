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
import { GatePassService } from './gate-pass.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { 
  CreateGatePassDto, 
  UpdateGatePassStatusByStaffDto, 
  UpdateGatePassStatusByHodDto,
  UpdateGatePassStatusByAcademicDirectorDto,
  UpdateGatePassBySecurityDto,
  UpdateGatePassStatusByHostelWardenDto,
  GatePassFilterDto 
} from './dto/gate-pass.dto';

@Controller('api/gate-passes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GatePassController {
  private readonly logger = new Logger(GatePassController.name);

  constructor(private readonly gatePassService: GatePassService) {}

  // Create a new gate pass request (student only)
  @Post()
  @Roles('student')
  create(@Request() req, @Body() createGatePassDto: CreateGatePassDto) {
    this.logger.log(`Student ${req.user.id || req.user.userId} creating gate pass`);
    return this.gatePassService.create(req.user.id || req.user.userId, createGatePassDto);
  }

  // Get all gate passes with filtering (admin only)
  @Get()
  @Roles('admin')
  findAll(@Query() filterDto: GatePassFilterDto) {
    return this.gatePassService.findAll(filterDto);
  }

  // Get gate passes for a student (student viewing their own passes)
  @Get('my-requests')
  async findMyRequests(@Request() req) {
    const userId = req.user.id || req.user.userId;
    this.logger.log(`User ${userId} retrieving their gate passes`);
    
    // Extract role name, handling both string and object formats
    const roleName = typeof req.user.role === 'string' 
      ? req.user.role 
      : (req.user.role?.name || '');
    
    // Only students can access this endpoint
    if (roleName !== 'student') {
      throw new ForbiddenException('Only students can access this endpoint');
    }
    
    return this.gatePassService.findByStudent(userId);
  }

  // Get gate passes pending staff approval
  @Get('pending-staff-approval')
  @Roles('staff')
  async findPendingStaffApproval(@Request() req) {
    const staffId = req.user.id || req.user.userId;
    this.logger.log(`Staff ${staffId} retrieving gate passes pending approval`);
    return this.gatePassService.findForStaffApproval(staffId);
  }

  // Get gate passes pending HOD approval
  @Get('pending-hod-approval')
  @Roles('hod')
  async findPendingHodApproval(@Request() req) {
    const hodId = req.user.id || req.user.userId;
    this.logger.log(`HOD ${hodId} retrieving gate passes pending approval`);
    return this.gatePassService.findForHodApproval(hodId);
  }

  // Get gate passes pending Academic Director approval
  @Get('pending-academic-director-approval')
  @Roles('academic_director')
  async findPendingAcademicDirectorApproval() {
    this.logger.log('Academic Director retrieving gate passes pending approval from all departments');
    return this.gatePassService.findForAcademicDirectorApproval();
  }

  // Get gate passes for security verification
  @Get('for-security-verification')
  @Roles('security')
  async findForSecurityVerification() {
    return this.gatePassService.findForSecurityVerification();
  }

  // Get pending gate passes for security (status starting with 'pending', both uppercase and lowercase)
  @Get('security-pending')
  @Roles('security')
  async findSecurityPending() {
    this.logger.log('Security retrieving gate passes with pending status (both uppercase and lowercase)');
    return this.gatePassService.findSecurityPending();
  }

  // Get used gate passes for security (already verified by security)
  @Get('security-used')
  @Roles('security')
  async findSecurityUsed() {
    this.logger.log('Security retrieving used gate passes');
    return this.gatePassService.findSecurityUsed();
  }

  // Get gate passes pending Hostel Warden approval
  @Get('pending-hostel-warden-approval')
  @Roles('hostel_warden')
  async findPendingHostelWardenApproval() {
    this.logger.log('Hostel Warden retrieving gate passes pending approval');
    return this.gatePassService.findForHostelWardenApproval();
  }

  // Get a specific gate pass by ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const gatePass = await this.gatePassService.findOne(id);
    
    // Extract role name, handling both string and object formats
    const roleName = typeof req.user.role === 'string' 
      ? req.user.role 
      : (req.user.role?.name || '');
    
    const userId = req.user.id || req.user.userId;
    
    // Check permissions based on role
    if (roleName === 'student' && gatePass.student_id !== userId) {
      throw new ForbiddenException('Students can only view their own gate passes');
    }
    
    if (roleName === 'staff' && gatePass.department_id !== req.user.department_id) {
      throw new ForbiddenException('Staff can only view gate passes from their department');
    }
    
    if (roleName === 'hod' && gatePass.department_id !== req.user.department_id) {
      throw new ForbiddenException('HOD can only view gate passes from their department');
    }
    
    // Academic Director, Security, and Admin can view all gate passes
    
    return gatePass;
  }

  // Update gate pass status by staff
  @Patch(':id/staff-approval')
  @Roles('staff')
  async updateByStaff(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGatePassStatusByStaffDto
  ) {
    const staffId = req.user.id || req.user.userId;
    this.logger.log(`Staff ${staffId} updating gate pass ${id} with status ${updateDto.status}`);
    return this.gatePassService.updateByStaff(id, staffId, updateDto);
  }

  // Update gate pass status by HOD
  @Patch(':id/hod-approval')
  @Roles('hod')
  async updateByHod(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGatePassStatusByHodDto
  ) {
    const hodId = req.user.id || req.user.userId;
    this.logger.log(`HOD ${hodId} updating gate pass ${id} with status ${updateDto.status}`);
    return this.gatePassService.updateByHod(id, hodId, updateDto);
  }

  // Update gate pass status by Academic Director
  @Patch(':id/academic-director-approval')
  @Roles('academic_director')
  async updateByAcademicDirector(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGatePassStatusByAcademicDirectorDto
  ) {
    const academicDirectorId = req.user.id || req.user.userId;
    this.logger.log(`Academic Director ${academicDirectorId} updating gate pass ${id} with status ${updateDto.status}`);
    return this.gatePassService.updateByAcademicDirector(id, academicDirectorId, updateDto);
  }

  // Update gate pass by Security (mark as used)
  @Patch(':id/security-verification')
  @Roles('security')
  async updateBySecurity(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGatePassBySecurityDto
  ) {
    const securityId = req.user.id || req.user.userId;
    this.logger.log(`Security ${securityId} marking gate pass ${id} as used, data: ${JSON.stringify(updateDto)}`);
    try {
      // Handle both formats of request body to make the API more flexible
      const processedUpdateDto: UpdateGatePassBySecurityDto = {
        status: 'used',
        security_comment: updateDto.security_comment || ''
      };
      
      return this.gatePassService.updateBySecurity(id, securityId, processedUpdateDto);
    } catch (error) {
      this.logger.error(`Error updating gate pass by security: ${error.message}`);
      throw error;
    }
  }

  // Update gate pass status by Hostel Warden
  @Patch(':id/hostel-warden-approval')
  @Roles('hostel_warden')
  async updateByHostelWarden(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGatePassStatusByHostelWardenDto
  ) {
    const hostelWardenId = req.user.id || req.user.userId;
    this.logger.log(`Hostel Warden ${hostelWardenId} updating gate pass ${id} with status ${updateDto.status}`);
    return this.gatePassService.updateByHostelWarden(id, hostelWardenId, updateDto);
  }
} 