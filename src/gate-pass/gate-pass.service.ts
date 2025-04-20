import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, LessThan, MoreThan, Like, In } from 'typeorm';
import { GatePass, GatePassStatus, GatePassType, RequesterType } from '../entities/gate-pass.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { EmailService } from '../email/email.service';
import { SmsService } from '../notification/sms.service';
import { 
  CreateGatePassDto, 
  CreateStaffGatePassDto,
  CreateHodGatePassDto,
  UpdateGatePassStatusByStaffDto, 
  UpdateGatePassStatusByHodDto,
  UpdateGatePassStatusByAcademicDirectorDto,
  UpdateGatePassBySecurityDto,
  UpdateGatePassStatusByHostelWardenDto,
  GatePassFilterDto 
} from './dto/gate-pass.dto';

@Injectable()
export class GatePassService {
  private readonly logger = new Logger(GatePassService.name);

  constructor(
    @InjectRepository(GatePass)
    private gatePassRepository: Repository<GatePass>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  // Create a new gate pass request
  async create(studentId: number, createGatePassDto: CreateGatePassDto): Promise<GatePass> {
    this.logger.log(`Creating gate pass for student ID: ${studentId}`);
    
    // Find the student
    const student = await this.userRepository.findOne({ 
      where: { id: studentId },
      relations: ['department', 'role'] 
    });
    
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    
    // Verify the user is a student
    const roleName = typeof student.role === 'string' 
      ? student.role 
      : (student.role?.name || '');
      
    if (roleName !== 'student') {
      throw new ForbiddenException('Only students can request gate passes');
    }

    // Create new gate pass
    const gatePass = new GatePass();
    gatePass.student = student;
    gatePass.student_id = student.id;
    gatePass.requester = student;
    gatePass.requester_id = student.id;
    gatePass.requester_type = RequesterType.STUDENT;
    gatePass.department = student.department;
    gatePass.department_id = student.department_id;
    gatePass.type = createGatePassDto.type;
    gatePass.reason = createGatePassDto.reason;
    gatePass.description = createGatePassDto.description || '';
    gatePass.start_date = new Date(createGatePassDto.start_date);
    gatePass.end_date = new Date(createGatePassDto.end_date);
    gatePass.status = GatePassStatus.PENDING_STAFF;

    // Validate dates
    if (gatePass.start_date > gatePass.end_date) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    // If dates are in the past
    const currentDate = new Date();
    if (gatePass.start_date < currentDate) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Save the gate pass
    const savedGatePass = await this.gatePassRepository.save(gatePass);
    
    // Find staff members in the same department to notify
    try {
      const staffMembers = await this.userRepository.find({
        where: {
          department_id: student.department_id,
          role: { name: 'staff' }
        },
        relations: ['role']
      });
      
      if (staffMembers && staffMembers.length > 0) {
        // Send email notification to the first staff member (or you could loop through all)
        await this.emailService.sendGatePassStaffNotification(savedGatePass, staffMembers[0]);
        this.logger.log(`Sent email notification to staff ${staffMembers[0].id} for new gate pass ${savedGatePass.id}`);
      }
    } catch (error) {
      // Just log the error but don't fail the request if email sending fails
      this.logger.error(`Failed to send staff notification for new gate pass: ${error.message}`);
    }
    
    return savedGatePass;
  }

  // Create a new gate pass request for staff
  async createForStaff(staffId: number, createGatePassDto: CreateStaffGatePassDto): Promise<GatePass> {
    this.logger.log(`Creating gate pass for staff ID: ${staffId}`);
    
    // Find the staff member
    const staff = await this.userRepository.findOne({ 
      where: { id: staffId },
      relations: ['department', 'role'] 
    });
    
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    
    // Verify the user is a staff
    const roleName = typeof staff.role === 'string' 
      ? staff.role 
      : (staff.role?.name || '');
      
    if (roleName !== 'staff') {
      throw new ForbiddenException('Only staff can request staff gate passes');
    }

    // Create new gate pass
    const gatePass = new GatePass();
    gatePass.requester = staff;
    gatePass.requester_id = staff.id;
    gatePass.requester_type = RequesterType.STAFF;
    gatePass.department = staff.department;
    gatePass.department_id = staff.department_id;
    gatePass.type = createGatePassDto.type;
    gatePass.reason = createGatePassDto.reason;
    gatePass.description = createGatePassDto.description || '';
    gatePass.start_date = new Date(createGatePassDto.start_date);
    gatePass.end_date = new Date(createGatePassDto.end_date);
    // Staff passes go directly to HOD, bypassing staff approval
    gatePass.status = GatePassStatus.PENDING_HOD;

    // Validate dates
    if (gatePass.start_date > gatePass.end_date) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    // If dates are in the past
    const currentDate = new Date();
    if (gatePass.start_date < currentDate) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Save the gate pass
    const savedGatePass = await this.gatePassRepository.save(gatePass);
    
    // Find HOD in the same department to notify
    try {
      const hod = await this.userRepository.findOne({
        where: {
          department_id: staff.department_id,
          role: { name: 'hod' }
        },
        relations: ['role']
      });
      
      if (hod) {
        // Send email notification to HOD
        await this.emailService.sendGatePassHodNotification(savedGatePass, hod);
        this.logger.log(`Sent email notification to HOD ${hod.id} for new staff gate pass ${savedGatePass.id}`);
      }
    } catch (error) {
      // Just log the error but don't fail the request if email sending fails
      this.logger.error(`Failed to send HOD notification for new staff gate pass: ${error.message}`);
    }
    
    return savedGatePass;
  }

  // Create a new gate pass request for HOD
  async createForHod(hodId: number, createGatePassDto: CreateHodGatePassDto): Promise<GatePass> {
    this.logger.log(`HOD ${hodId} creating gate pass with data: ${JSON.stringify(createGatePassDto)}`);
    
    try {
      // Find the HOD user
      const hod = await this.userRepository.findOne({
        where: { id: hodId },
        relations: ['department', 'role']
      });
      
      if (!hod) {
        this.logger.error(`HOD with ID ${hodId} not found`);
        throw new NotFoundException('HOD not found');
      }
      
      // Verify role
      const roleName = typeof hod.role === 'string' 
        ? hod.role 
        : (hod.role?.name || '');
        
      this.logger.log(`HOD role verification: ${roleName}`);
        
      if (roleName !== 'hod') {
        this.logger.error(`User ${hodId} with role ${roleName} attempted to create HOD gate pass`);
        throw new ForbiddenException('Only HODs can request HOD gate passes');
      }

      // Create new gate pass
      const gatePass = new GatePass();
      gatePass.requester = hod;
      gatePass.requester_id = hod.id;
      
      // Set requester_type, using the provided value in DTO if present, otherwise default to HOD
      gatePass.requester_type = RequesterType.HOD; // Always set this directly to ensure consistency
      this.logger.log(`Setting requester_type to: ${gatePass.requester_type}`);
      
      gatePass.department = hod.department;
      gatePass.department_id = hod.department_id;
      gatePass.type = createGatePassDto.type;
      gatePass.reason = createGatePassDto.reason;
      gatePass.description = createGatePassDto.description || '';
      
      // Ensure dates are properly parsed
      try {
        gatePass.start_date = new Date(createGatePassDto.start_date);
        gatePass.end_date = new Date(createGatePassDto.end_date);
      } catch (error) {
        this.logger.error(`Date parsing error: ${error.message}`);
        throw new BadRequestException(`Invalid date format: ${error.message}`);
      }
      
      // HOD passes go directly to academic director, bypassing staff and HOD approval
      gatePass.status = GatePassStatus.PENDING_ACADEMIC_DIRECTOR_FROM_HOD;

      // Validate dates
      if (isNaN(gatePass.start_date.getTime()) || isNaN(gatePass.end_date.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      
      if (gatePass.start_date > gatePass.end_date) {
        throw new BadRequestException('Start date cannot be after end date');
      }

      // If dates are in the past
      const currentDate = new Date();
      if (gatePass.start_date < currentDate) {
        throw new BadRequestException('Start date cannot be in the past');
      }

      // Save the gate pass
      this.logger.log(`Attempting to save gate pass for HOD ${hodId}`);
      const savedGatePass = await this.gatePassRepository.save(gatePass);
      this.logger.log(`Gate pass created successfully with ID: ${savedGatePass.id}`);
      
      // Find Academic Director to notify
      try {
        const academicDirector = await this.userRepository.findOne({
          where: {
            role: { name: 'academic_director' }
          },
          relations: ['role']
        });
        
        if (academicDirector) {
          // Send email notification to Academic Director
          await this.emailService.sendGatePassAcademicDirectorNotification(savedGatePass, academicDirector);
          this.logger.log(`Sent email notification to Academic Director ${academicDirector.id} for new HOD gate pass ${savedGatePass.id}`);
        } else {
          this.logger.warn('No Academic Director found to notify');
        }
      } catch (error) {
        // Just log the error but don't fail the request if email sending fails
        this.logger.error(`Failed to send Academic Director notification for new HOD gate pass: ${error.message}`);
      }
      
      return savedGatePass;
    } catch (error) {
      this.logger.error(`Error creating HOD gate pass: ${error.message}`);
      throw error;
    }
  }

  // Get gate passes by staff (for their own requests)
  async findByStaff(staffId: number): Promise<GatePass[]> {
    return this.gatePassRepository.find({
      where: { 
        requester_id: staffId,
        requester_type: RequesterType.STAFF
      },
      relations: ['requester', 'department', 'hod', 'academicDirector', 'security'],
      order: {
        updated_at: 'DESC'
      }
    });
  }

  // Get gate passes by HOD (for their own requests)
  async findByHod(hodId: number): Promise<GatePass[]> {
    return this.gatePassRepository.find({
      where: { 
        requester_id: hodId,
        requester_type: RequesterType.HOD
      },
      relations: ['requester', 'department', 'academicDirector', 'security'],
      order: {
        updated_at: 'DESC'
      }
    });
  }

  // Update gate pass status by staff
  async updateByStaff(gatePassId: number, staffId: number, updateDto: UpdateGatePassStatusByStaffDto): Promise<GatePass> {
    this.logger.log(`Updating gate pass ${gatePassId} by staff ${staffId}`);
    
    // Find the gate pass
    const gatePass = await this.gatePassRepository.findOne({
      where: { id: gatePassId },
      relations: ['student', 'student.department', 'department']
    });
    
    if (!gatePass) {
      throw new NotFoundException(`Gate pass with ID ${gatePassId} not found`);
    }
    
    // Check if the gate pass is in the correct state
    if (gatePass.status !== GatePassStatus.PENDING_STAFF) {
      throw new BadRequestException(`Gate pass is not in pending staff status. Current status: ${gatePass.status}`);
    }
    
    // Find the staff
    const staff = await this.userRepository.findOne({ 
      where: { id: staffId },
      relations: ['department', 'role'] 
    });
    
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    
    // Verify role
    const roleName = typeof staff.role === 'string' 
      ? staff.role 
      : (staff.role?.name || '');
      
    if (roleName !== 'staff') {
      throw new ForbiddenException('Only staff can approve at this stage');
    }
    
    // Verify staff is from the same department as the student
    if (staff.department_id !== gatePass.department_id) {
      throw new ForbiddenException('Staff can only approve gate passes from their own department');
    }
    
    // Update gate pass
    gatePass.staff = staff;
    gatePass.staff_id = staff.id;
    gatePass.staff_comment = updateDto.staff_comment || '';
    
    if (updateDto.status === 'approved_by_staff') {
      gatePass.status = GatePassStatus.PENDING_HOD;
      
      // Find the HOD for this department to send email notification
      const hod = await this.userRepository.findOne({
        where: {
          department_id: gatePass.department_id,
          role: { name: 'hod' }
        },
        relations: ['role']
      });
      
      if (hod) {
        // Send email notification to HOD
        await this.emailService.sendGatePassHodNotification(gatePass, hod);
        this.logger.log(`Sent email notification to HOD ${hod.id} for gate pass ${gatePassId}`);
      }
    } else {
      gatePass.status = GatePassStatus.REJECTED_BY_STAFF;
    }
    
    return this.gatePassRepository.save(gatePass);
  }
  
  // Update gate pass status by HOD
  async updateByHod(gatePassId: number, hodId: number, updateDto: UpdateGatePassStatusByHodDto): Promise<GatePass> {
    this.logger.log(`Updating gate pass ${gatePassId} by HOD ${hodId}`);
    
    // Find the gate pass
    const gatePass = await this.gatePassRepository.findOne({
      where: { id: gatePassId },
      relations: ['student', 'student.department', 'student.dayScholarHosteller', 'department', 'staff', 'requester']
    });
    
    if (!gatePass) {
      throw new NotFoundException(`Gate pass with ID ${gatePassId} not found`);
    }
    
    // Check if the gate pass is in the correct state
    if (gatePass.status !== GatePassStatus.PENDING_HOD) {
      throw new BadRequestException(`Gate pass is not in pending HOD status. Current status: ${gatePass.status}`);
    }
    
    // Find the HOD
    const hod = await this.userRepository.findOne({ 
      where: { id: hodId },
      relations: ['department', 'role'] 
    });
    
    if (!hod) {
      throw new NotFoundException('HOD not found');
    }
    
    // Verify role
    const roleName = typeof hod.role === 'string' 
      ? hod.role 
      : (hod.role?.name || '');
      
    if (roleName !== 'hod') {
      throw new ForbiddenException('Only HOD can approve at this stage');
    }
    
    // Verify HOD is from the same department as the requester
    // For staff gate passes, check requester's department
    // For student gate passes, check student's department
    let requestDepartmentId;
    
    if (gatePass.requester_type === RequesterType.STAFF) {
      requestDepartmentId = gatePass.department_id;
    } else if (gatePass.student && gatePass.student.department_id) {
      requestDepartmentId = gatePass.student.department_id;
    } else {
      requestDepartmentId = gatePass.department_id;
    }
      
    if (hod.department_id !== requestDepartmentId) {
      throw new ForbiddenException('HOD can only approve gate passes from their own department');
    }
    
    // Update gate pass
    gatePass.hod = hod;
    gatePass.hod_id = hod.id;
    gatePass.hod_comment = updateDto.hod_comment || '';
    
    if (updateDto.status === 'approved_by_hod') {
      // Check if this is a student gate pass and if the student is a hosteller
      if (gatePass.requester_type === RequesterType.STUDENT && 
          gatePass.student && 
          gatePass.student.dayScholarHosteller?.type?.toLowerCase() === 'hosteller') {
        // If the student is a hosteller, route to hostel warden
        gatePass.status = GatePassStatus.PENDING_HOSTEL_WARDEN;
        
        // Try to find hostel warden and send notification
        try {
          const hostelWarden = await this.userRepository.findOne({
            where: {
              role: { name: 'hostel_warden' }
            },
            relations: ['role']
          });
          
          if (hostelWarden) {
            // Send email notification to hostel warden
            await this.emailService.sendGatePassHostelWardenNotification(gatePass, hostelWarden);
            this.logger.log(`Sent email notification to Hostel Warden for gate pass ${gatePassId}`);
          }
        } catch (error) {
          // Just log error but don't fail request
          this.logger.error(`Error sending notification to hostel warden: ${error.message}`);
        }
      } else {
        // For non-hostellers, staff, and HOD, route directly to academic director
        gatePass.status = GatePassStatus.PENDING_ACADEMIC_DIRECTOR;
        
        // Try to find academic director and send notification
        try {
          const academicDirector = await this.userRepository.findOne({
            where: {
              role: { name: 'academic_director' }
            },
            relations: ['role']
          });
          
          if (academicDirector) {
            // Send email notification to academic director
            await this.emailService.sendGatePassAcademicDirectorNotification(gatePass, academicDirector);
            this.logger.log(`Sent email notification to Academic Director for gate pass ${gatePassId}`);
          }
        } catch (error) {
          // Just log error but don't fail request
          this.logger.error(`Error sending notification to academic director: ${error.message}`);
        }
      }
    } else {
      gatePass.status = GatePassStatus.REJECTED_BY_HOD;
      
      // Send rejection notification based on requester type
      try {
        if (gatePass.requester_type === RequesterType.STUDENT && gatePass.student) {
          if (gatePass.student.email) {
            await this.emailService.sendGatePassStudentNotification(gatePass, gatePass.student);
            this.logger.log(`Sent rejection notification to student ${gatePass.student.id} for gate pass ${gatePassId}`);
          }
        } else if (gatePass.requester_type === RequesterType.STAFF && gatePass.requester) {
          if (gatePass.requester.email) {
            await this.emailService.sendGatePassStudentNotification(gatePass, gatePass.requester);
            this.logger.log(`Sent rejection notification to staff ${gatePass.requester.id} for gate pass ${gatePassId}`);
          }
        }
      } catch (error) {
        // Just log error but don't fail request
        this.logger.error(`Error sending rejection notification: ${error.message}`);
      }
    }
    
    return this.gatePassRepository.save(gatePass);
  }
  
  // Update gate pass status by Academic Director
  async updateByAcademicDirector(
    gatePassId: number, 
    academicDirectorId: number, 
    updateDto: UpdateGatePassStatusByAcademicDirectorDto
  ): Promise<GatePass> {
    this.logger.log(`Updating gate pass ${gatePassId} by Academic Director ${academicDirectorId}`);
    
    // Find the gate pass
    const gatePass = await this.gatePassRepository.findOne({
      where: { id: gatePassId },
      relations: ['requester', 'student', 'student.department', 'department', 'staff', 'hod']
    });
    
    if (!gatePass) {
      throw new NotFoundException(`Gate pass with ID ${gatePassId} not found`);
    }
    
    // Check if the gate pass is in the correct state
    const validStatuses = [
      GatePassStatus.PENDING_ACADEMIC_DIRECTOR,
      GatePassStatus.PENDING_ACADEMIC_DIRECTOR_FROM_STAFF,
      GatePassStatus.PENDING_ACADEMIC_DIRECTOR_FROM_HOD
    ];
    
    if (!validStatuses.includes(gatePass.status)) {
      throw new BadRequestException(`Gate pass is not in pending Academic Director status. Current status: ${gatePass.status}`);
    }
    
    // Find the Academic Director
    const academicDirector = await this.userRepository.findOne({ 
      where: { id: academicDirectorId },
      relations: ['role'] 
    });
    
    if (!academicDirector) {
      throw new NotFoundException('Academic Director not found');
    }
    
    // Verify role
    const roleName = typeof academicDirector.role === 'string' 
      ? academicDirector.role 
      : (academicDirector.role?.name || '');
      
    if (roleName !== 'academic_director') {
      throw new ForbiddenException('Only Academic Director can approve at this stage');
    }
    
    // Update gate pass
    gatePass.academicDirector = academicDirector;
    gatePass.academic_director_id = academicDirector.id;
    gatePass.academic_director_comment = updateDto.academic_director_comment || '';
    
    if (updateDto.status === 'approved') {
      gatePass.status = GatePassStatus.APPROVED;
      
      // Send notification based on requester type
      if (gatePass.requester_type === RequesterType.STUDENT && gatePass.student) {
        // Send to student
        if (gatePass.student.email) {
          await this.emailService.sendGatePassStudentNotification(gatePass, gatePass.student);
          this.logger.log(`Sent approval notification to student ${gatePass.student.id} for gate pass ${gatePassId}`);
        }
      } else if (gatePass.requester) {
        // Send to staff or HOD
        if (gatePass.requester.email) {
          await this.emailService.sendGatePassStudentNotification(gatePass, gatePass.requester);
          this.logger.log(`Sent approval notification to ${gatePass.requester_type} ${gatePass.requester.id} for gate pass ${gatePassId}`);
        }
      }
    } else {
      gatePass.status = GatePassStatus.REJECTED_BY_ACADEMIC_DIRECTOR;
      
      // Send notification based on requester type
      if (gatePass.requester_type === RequesterType.STUDENT && gatePass.student) {
        // Send to student
        if (gatePass.student.email) {
          await this.emailService.sendGatePassStudentNotification(gatePass, gatePass.student);
          this.logger.log(`Sent rejection notification to student ${gatePass.student.id} for gate pass ${gatePassId}`);
        }
      } else if (gatePass.requester) {
        // Send to staff or HOD
        if (gatePass.requester.email) {
          await this.emailService.sendGatePassStudentNotification(gatePass, gatePass.requester);
          this.logger.log(`Sent rejection notification to ${gatePass.requester_type} ${gatePass.requester.id} for gate pass ${gatePassId}`);
        }
      }
    }
    
    return this.gatePassRepository.save(gatePass);
  }
  
  // Update gate pass by Security (mark as used when user leaves campus)
  async updateBySecurity(
    gatePassId: number, 
    securityId: number, 
    updateDto: UpdateGatePassBySecurityDto
  ): Promise<GatePass> {
    this.logger.log(`Updating gate pass ${gatePassId} by Security ${securityId}, data: ${JSON.stringify(updateDto)}`);
    
    try {
      // Find the gate pass
      const gatePass = await this.gatePassRepository.findOne({
        where: { id: gatePassId },
        relations: ['requester', 'student', 'department', 'staff', 'hod', 'academicDirector']
      });
      
      if (!gatePass) {
        throw new NotFoundException(`Gate pass with ID ${gatePassId} not found`);
      }
      
      // Check if the gate pass is in the correct state (must be approved)
      if (gatePass.status !== GatePassStatus.APPROVED) {
        throw new BadRequestException(`Gate pass is not approved. Current status: ${gatePass.status}`);
      }
      
      // Find the Security
      const security = await this.userRepository.findOne({ 
        where: { id: securityId },
        relations: ['role'] 
      });
      
      if (!security) {
        throw new NotFoundException('Security not found');
      }
      
      // Verify role
      const roleName = typeof security.role === 'string' 
        ? security.role 
        : (security.role?.name || '');
        
      if (roleName !== 'security') {
        throw new ForbiddenException('Only Security can mark a gate pass as used');
      }
      
      // Check if within valid date range, with more flexibility
      const currentDate = new Date();
      const startDate = new Date(gatePass.start_date);
      const endDate = new Date(gatePass.end_date);
      
      // Make the date check more lenient - allow checking out on the same day
      // even if a few hours before official start time
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // Add a 24-hour buffer to both start and end dates
      const bufferStartDate = new Date(startDate);
      bufferStartDate.setDate(bufferStartDate.getDate() - 1);
      
      const bufferEndDate = new Date(endDate);
      bufferEndDate.setDate(bufferEndDate.getDate() + 1);
      
      this.logger.log(`Gate pass valid period: ${bufferStartDate.toISOString()} to ${bufferEndDate.toISOString()}`);
      this.logger.log(`Current date: ${currentDate.toISOString()}`);
      
      if (currentDate < bufferStartDate || currentDate > bufferEndDate) {
        this.logger.warn(`Gate pass ${gatePassId} date range check failed: current date ${currentDate.toISOString()} outside of valid range`);
        throw new BadRequestException('Gate pass is not valid for the current date');
      }
      
      // Update gate pass
      gatePass.security = security;
      gatePass.security_id = security.id;
      gatePass.security_comment = updateDto.security_comment || '';
      gatePass.status = GatePassStatus.USED;
      gatePass.checkout_time = currentDate;
      
      const savedGatePass = await this.gatePassRepository.save(gatePass);
      this.logger.log(`Gate pass ${gatePassId} successfully marked as used`);
      
      // Send SMS notification to parent if it's a student gate pass
      if (gatePass.requester_type === RequesterType.STUDENT && gatePass.student) {
        this.logger.log(`Student gate pass detected, attempting to send SMS notification for student ID: ${gatePass.student.id}`);
        try {
          // Replace this:
          const student = await this.userRepository.findOne({
            where: { id: gatePass.student.id },
            relations: ['dayScholarHosteller']
          });

          // With this direct query using the entity manager:
          const entityManager = this.gatePassRepository.manager;
          const query = `
            SELECT u.id, u.name, dsh.id as dsh_id, dsh.type, dsh.parent_number 
            FROM users u
            LEFT JOIN day_scholar_hostellers dsh ON u.day_scholar_hosteller_id = dsh.id
            WHERE u.id = $1
          `;
          const rawResult = await entityManager.query(query, [gatePass.student.id]);
          this.logger.log(`Raw database query result: ${JSON.stringify(rawResult)}`);

          let parentNumber = null;
          if (rawResult && rawResult.length > 0) {
            parentNumber = rawResult[0].parent_number;
            this.logger.log(`Found parent number directly from DB: "${parentNumber}"`);
          } else {
            this.logger.log(`No results found from direct query for student ${gatePass.student.id}`);
          }

          // If we got a parent number from direct query, use it
          if (parentNumber) {
            this.logger.log(`Sending SMS to parent number: ${parentNumber}`);
            const smsResult = await this.smsService.sendParentExitNotification(
              parentNumber,
              gatePass.student.name || `Student #${gatePass.student.id}`,
              currentDate
            );
            
            if (smsResult) {
              this.logger.log(`SMS sent successfully for student ${gatePass.student.id}`);
            } else {
              this.logger.warn(`SMS service returned null for student ${gatePass.student.id}`);
            }
          } else {
            this.logger.warn(`Parent number is empty for student ${gatePass.student.id}`);
          }
        } catch (error) {
          // Just log the error, don't affect the main function
          this.logger.error(`Failed to send SMS notification: ${error.message}`);
          if (error.stack) {
            this.logger.error(`Stack trace: ${error.stack}`);
          }
        }
      }
      
      return savedGatePass;
    } catch (error) {
      this.logger.error(`Error in updateBySecurity: ${error.message}`);
      throw error;
    }
  }
  
  // Get gate pass by ID
  async findOne(id: number): Promise<GatePass> {
    const gatePass = await this.gatePassRepository.findOne({
      where: { id },
      relations: ['requester', 'student', 'department', 'staff', 'hod', 'academicDirector', 'security', 'hostelWarden']
    });
    
    if (!gatePass) {
      throw new NotFoundException(`Gate pass with ID ${id} not found`);
    }
    
    return gatePass;
  }
  
  // Get all gate passes with filtering
  async findAll(filterDto: GatePassFilterDto): Promise<GatePass[]> {
    const where: FindOptionsWhere<GatePass> = {};
    
    if (filterDto.status) {
      where.status = filterDto.status as GatePassStatus;
    }
    
    if (filterDto.student_id) {
      where.student_id = filterDto.student_id;
    }
    
    if (filterDto.requester_id) {
      where.requester_id = filterDto.requester_id;
    }
    
    if (filterDto.requester_type) {
      where.requester_type = filterDto.requester_type;
    }
    
    if (filterDto.department_id) {
      where.department_id = filterDto.department_id;
    }
    
    // Filter by date range if both start and end dates are provided
    if (filterDto.start_date && filterDto.end_date) {
      const startDate = new Date(filterDto.start_date);
      const endDate = new Date(filterDto.end_date);
      where.start_date = Between(startDate, endDate);
    }
    
    return this.gatePassRepository.find({
      where,
      relations: ['requester', 'student', 'department', 'staff', 'hod', 'academicDirector', 'security', 'hostelWarden'],
      order: {
        updated_at: 'DESC'
      }
    });
  }
  
  // Get gate passes for a student
  async findByStudent(studentId: number): Promise<GatePass[]> {
    return this.gatePassRepository.find({
      where: { 
        requester_id: studentId,
        requester_type: RequesterType.STUDENT
      },
      relations: ['requester', 'student', 'department', 'staff', 'hod', 'academicDirector', 'security', 'hostelWarden'],
      order: {
        updated_at: 'DESC'
      }
    });
  }
  
  // Get gate passes for staff approval
  async findForStaffApproval(staffId: number): Promise<GatePass[]> {
    // Get the staff to check their department
    const staff = await this.userRepository.findOne({
      where: { id: staffId },
      relations: ['department']
    });
    
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    
    return this.gatePassRepository.find({
      where: { 
        department_id: staff.department_id,
        status: GatePassStatus.PENDING_STAFF
      },
      relations: ['requester', 'student', 'department'],
      order: {
        created_at: 'ASC'
      }
    });
  }
  
  // Get gate passes for HOD approval
  async findForHodApproval(hodId: number): Promise<GatePass[]> {
    // Get the HOD to check their department
    const hod = await this.userRepository.findOne({
      where: { id: hodId },
      relations: ['department']
    });
    
    if (!hod) {
      throw new NotFoundException('HOD not found');
    }
    
    return this.gatePassRepository.find({
      where: { 
        department_id: hod.department_id,
        status: GatePassStatus.PENDING_HOD
      },
      relations: ['requester', 'student', 'department', 'staff'],
      order: {
        updated_at: 'ASC'
      }
    });
  }
  
  // Get gate passes for Academic Director approval
  async findForAcademicDirectorApproval(): Promise<GatePass[]> {
    // Academic Director (Principal) can see all gate passes from every department
    // that are pending their approval from students, staff, or HODs
    
    const validStatuses = [
      GatePassStatus.PENDING_ACADEMIC_DIRECTOR,
      GatePassStatus.PENDING_ACADEMIC_DIRECTOR_FROM_STAFF,
      GatePassStatus.PENDING_ACADEMIC_DIRECTOR_FROM_HOD
    ];
    
    return this.gatePassRepository.find({
      where: { 
        status: In(validStatuses)
      },
      relations: ['requester', 'student', 'student.department', 'department', 'staff', 'hod'],
      order: {
        department_id: 'ASC', // Group by department
        updated_at: 'ASC'     // Then by update time
      }
    });
  }
  
  // Get gate passes for Security verification
  async findForSecurityVerification(): Promise<GatePass[]> {
    this.logger.log('Finding gate passes for security verification');
    
    // Current date
    const currentDate = new Date();
    
    try {
      // Calculate yesterday, today and tomorrow to ensure a wider window for gate passes
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(currentDate.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      
      this.logger.log(`Fetching approved gate passes from ${yesterday.toISOString()} to ${tomorrow.toISOString()}`);
      
      // Find all approved passes that are valid within the next 24 hours
      const gatePasses = await this.gatePassRepository.find({
        where: [
          {
            status: GatePassStatus.APPROVED,
            start_date: Between(yesterday, tomorrow)
          },
          {
            status: GatePassStatus.APPROVED,
            end_date: Between(yesterday, tomorrow)
          },
          {
            status: GatePassStatus.APPROVED,
            start_date: LessThan(yesterday),
            end_date: MoreThan(tomorrow)
          }
        ],
        relations: ['requester', 'student', 'department', 'staff', 'hod', 'academicDirector'],
        order: {
          start_date: 'ASC'
        }
      });
      
      this.logger.log(`Found ${gatePasses.length} gate passes for security verification`);
      return gatePasses;
    } catch (error) {
      this.logger.error(`Error fetching gate passes for security: ${error.message}`);
      // Return empty array instead of throwing to avoid breaking the frontend
      return [];
    }
  }
  
  // Get pending gate passes for security (approved but not used)
  async findSecurityPending(): Promise<GatePass[]> {
    this.logger.log('Finding pending gate passes for security');
    
    try {
      // Define an array of all pending statuses with both upper and lowercase
      const pendingStatuses = [
        GatePassStatus.PENDING_STAFF,
        GatePassStatus.PENDING_HOD,
        GatePassStatus.PENDING_ACADEMIC_DIRECTOR,
        GatePassStatus.PENDING_HOSTEL_WARDEN,
        GatePassStatus.PENDING_ACADEMIC_DIRECTOR_FROM_STAFF,
        GatePassStatus.PENDING_ACADEMIC_DIRECTOR_FROM_HOD,
        // Add lowercase versions if needed
        'pending_staff',
        'pending_hod',
        'pending_academic_director',
        'pending_hostel_warden',
        'pending_academic_director_from_staff',
        'pending_academic_director_from_hod'
      ];
      
      this.logger.log(`Searching for gate passes with status in: ${pendingStatuses.join(', ')}`);
      
      // Query directly using IN operator with both enum values and lowercase strings
      const gatePasses = await this.gatePassRepository.find({
      where: {
          status: In(pendingStatuses)
        },
        relations: ['requester', 'student', 'department', 'staff', 'hod', 'academicDirector'],
      order: {
        start_date: 'ASC'
      }
    });
      
      this.logger.log(`Found ${gatePasses.length} pending gate passes for security`);
      return gatePasses;
    } catch (error) {
      this.logger.error(`Error fetching pending gate passes for security: ${error.message}`);
      // Return empty array instead of throwing to avoid breaking the frontend
      return [];
    }
  }
  
  // Get used gate passes for security (already verified)
  async findSecurityUsed(): Promise<GatePass[]> {
    this.logger.log('Finding used gate passes for security');
    
    // Get current date
    const currentDate = new Date();
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    
    try {
      // Find all used passes from the last 7 days
      const gatePasses = await this.gatePassRepository.find({
        where: {
          status: GatePassStatus.USED,
          updated_at: Between(sevenDaysAgo, currentDate)
        },
        relations: ['requester', 'student', 'department', 'staff', 'hod', 'academicDirector', 'security'],
        order: {
          updated_at: 'DESC'
        }
      });
      
      this.logger.log(`Found ${gatePasses.length} used gate passes for security from the last 7 days`);
      return gatePasses;
    } catch (error) {
      this.logger.error(`Error fetching used gate passes for security: ${error.message}`);
      // Return empty array instead of throwing to avoid breaking the frontend
      return [];
    }
  }
  
  // Update gate pass status by Hostel Warden
  async updateByHostelWarden(
    gatePassId: number, 
    hostelWardenId: number, 
    updateDto: UpdateGatePassStatusByHostelWardenDto
  ): Promise<GatePass> {
    this.logger.log(`Updating gate pass ${gatePassId} by Hostel Warden ${hostelWardenId}`);
    
    // Find the gate pass
    const gatePass = await this.gatePassRepository.findOne({
      where: { id: gatePassId },
      relations: ['requester', 'student', 'student.department', 'department', 'staff', 'hod']
    });
    
    if (!gatePass) {
      throw new NotFoundException(`Gate pass with ID ${gatePassId} not found`);
    }
    
    // Check if the gate pass is in the correct state
    if (gatePass.status !== GatePassStatus.PENDING_HOSTEL_WARDEN) {
      throw new BadRequestException(`Gate pass is not in pending Hostel Warden status. Current status: ${gatePass.status}`);
    }
    
    // Find the Hostel Warden
    const hostelWarden = await this.userRepository.findOne({ 
      where: { id: hostelWardenId },
      relations: ['role'] 
    });
    
    if (!hostelWarden) {
      throw new NotFoundException('Hostel Warden not found');
    }
    
    // Verify role
    const roleName = typeof hostelWarden.role === 'string' 
      ? hostelWarden.role 
      : (hostelWarden.role?.name || '');
      
    if (roleName !== 'hostel_warden') {
      throw new ForbiddenException('Only Hostel Warden can approve at this stage');
    }
    
    // Update gate pass
    gatePass.hostelWarden = hostelWarden;
    gatePass.hostel_warden_id = hostelWarden.id;
    gatePass.hostel_warden_comment = updateDto.hostel_warden_comment || '';
    
    if (updateDto.status === 'approved_by_hostel_warden') {
      gatePass.status = GatePassStatus.PENDING_ACADEMIC_DIRECTOR;
      
      // Find academic director to send email notification
      const academicDirector = await this.userRepository.findOne({
        where: { role: { name: 'academic_director' } },
        relations: ['role']
      });
      
      if (academicDirector) {
        // Send email notification to Academic Director
        await this.emailService.sendGatePassAcademicDirectorNotification(gatePass, academicDirector);
        this.logger.log(`Sent email notification to Academic Director ${academicDirector.id} for gate pass ${gatePassId}`);
      }
    } else {
      gatePass.status = GatePassStatus.REJECTED_BY_HOSTEL_WARDEN;
      
      // Send rejection notification to student (only applies to student gate passes)
      if (gatePass.student && gatePass.student.email) {
        await this.emailService.sendGatePassStudentNotification(gatePass, gatePass.student);
        this.logger.log(`Sent rejection notification to student ${gatePass.student.id} for gate pass ${gatePassId}`);
      }
    }
    
    return this.gatePassRepository.save(gatePass);
  }
  
  // Add a new method to get gate passes for Hostel Warden approval
  async findForHostelWardenApproval(): Promise<GatePass[]> {
    return this.gatePassRepository.find({
      where: { status: GatePassStatus.PENDING_HOSTEL_WARDEN },
      relations: ['requester', 'student', 'student.department', 'student.dayScholarHosteller', 'department', 'staff', 'hod'],
      order: {
        updated_at: 'ASC'
      }
    });
  }

  // Temporary method to test SMS notification
  async testSmsNotification(): Promise<any> {
    try {
      this.logger.log('Running SMS notification test');
      
      // Create a test date
      const currentDate = new Date();
      
      // First try to get the parent_number directly from database
      const entityManager = this.gatePassRepository.manager;
      const query = `
        SELECT dsh.parent_number 
        FROM day_scholar_hostellers dsh
        WHERE dsh.parent_number IS NOT NULL
        LIMIT 1
      `;
      
      const rawResult = await entityManager.query(query);
      this.logger.log(`Direct database query for parent numbers: ${JSON.stringify(rawResult)}`);
      
      let parentNumber = '7904612266'; // Default fallback number
      
      if (rawResult && rawResult.length > 0 && rawResult[0].parent_number) {
        parentNumber = rawResult[0].parent_number;
        this.logger.log(`Using parent number from database: ${parentNumber}`);
      } else {
        this.logger.log(`No parent numbers found in database, using hardcoded test number: ${parentNumber}`);
      }
      
      // Test SMS directly using the number we found or our hardcoded fallback
      const smsResult = await this.smsService.sendParentExitNotification(
        parentNumber,
        'Test Student',
        currentDate
      );
      
      if (smsResult) {
        this.logger.log(`Test SMS sent successfully: ${JSON.stringify(smsResult)}`);
      } else {
        this.logger.error('Test SMS failed to send (null result)');
      }
      
      return { 
        success: !!smsResult, 
        result: smsResult,
        phoneNumber: parentNumber 
      };
    } catch (error) {
      this.logger.error(`Test SMS error: ${error.message}`);
      if (error.stack) {
        this.logger.error(`Stack trace: ${error.stack.substring(0, 500)}`);
      }
      return { success: false, error: error.message };
    }
  }
} 