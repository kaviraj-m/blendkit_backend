import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, LessThan, MoreThan, Like, In } from 'typeorm';
import { GatePass, GatePassStatus, GatePassType } from '../entities/gate-pass.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { 
  CreateGatePassDto, 
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

    return this.gatePassRepository.save(gatePass);
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
      relations: ['student', 'student.department', 'student.dayScholarHosteller', 'department', 'staff']
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
    
    // Verify HOD is from the same department as the student
    if (hod.department_id !== gatePass.department_id) {
      throw new ForbiddenException('HOD can only approve gate passes from their own department');
    }
    
    // Update gate pass
    gatePass.hod = hod;
    gatePass.hod_id = hod.id;
    gatePass.hod_comment = updateDto.hod_comment || '';
    
    if (updateDto.status === 'approved_by_hod') {
      // Check if student is a hosteller or day scholar
      // We need to get the DayScholarHosteller type
      const dayScholarHostellerType = gatePass.student.dayScholarHosteller?.type?.toLowerCase() || '';
      
      if (dayScholarHostellerType === 'hosteller') {
        // If hosteller, next approval is by hostel warden
        gatePass.status = GatePassStatus.PENDING_HOSTEL_WARDEN;
        this.logger.log(`Gate pass ${gatePassId} is for a hosteller, sending to hostel warden for approval`);
      } else {
        // If day scholar, next approval is by academic director
        gatePass.status = GatePassStatus.PENDING_ACADEMIC_DIRECTOR;
        this.logger.log(`Gate pass ${gatePassId} is for a day scholar, sending directly to academic director`);
      }
    } else {
      gatePass.status = GatePassStatus.REJECTED_BY_HOD;
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
      relations: ['student', 'student.department', 'department', 'staff', 'hod']
    });
    
    if (!gatePass) {
      throw new NotFoundException(`Gate pass with ID ${gatePassId} not found`);
    }
    
    // Check if the gate pass is in the correct state
    if (gatePass.status !== GatePassStatus.PENDING_ACADEMIC_DIRECTOR) {
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
    
    // Academic Director (Principal) can approve gate passes from any department
    // No need to check department as they oversee the entire college
    
    // Update gate pass
    gatePass.academicDirector = academicDirector;
    gatePass.academic_director_id = academicDirector.id;
    gatePass.academic_director_comment = updateDto.academic_director_comment || '';
    
    if (updateDto.status === 'approved') {
      gatePass.status = GatePassStatus.APPROVED;
    } else {
      gatePass.status = GatePassStatus.REJECTED_BY_ACADEMIC_DIRECTOR;
    }
    
    return this.gatePassRepository.save(gatePass);
  }
  
  // Update gate pass by Security (mark as used when student leaves campus)
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
        relations: ['student', 'department', 'staff', 'hod', 'academicDirector']
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
      relations: ['student', 'department', 'staff', 'hod', 'academicDirector', 'security']
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
      relations: ['student', 'department', 'staff', 'hod', 'academicDirector', 'security'],
      order: {
        updated_at: 'DESC'
      }
    });
  }
  
  // Get gate passes for a student
  async findByStudent(studentId: number): Promise<GatePass[]> {
    return this.gatePassRepository.find({
      where: { student_id: studentId },
      relations: ['student', 'department', 'staff', 'hod', 'academicDirector', 'security'],
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
      relations: ['student', 'department'],
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
      relations: ['student', 'department', 'staff'],
      order: {
        updated_at: 'ASC'
      }
    });
  }
  
  // Get gate passes for Academic Director approval
  async findForAcademicDirectorApproval(): Promise<GatePass[]> {
    // Academic Director (Principal) can see all gate passes from every department
    // that have been approved by their respective HODs
    return this.gatePassRepository.find({
      where: { status: GatePassStatus.PENDING_ACADEMIC_DIRECTOR },
      relations: ['student', 'student.department', 'department', 'staff', 'hod'],
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
        relations: ['student', 'department', 'staff', 'hod', 'academicDirector'],
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
        // Add lowercase versions if needed
        'pending_staff',
        'pending_hod',
        'pending_academic_director',
        'pending_hostel_warden'
      ];
      
      this.logger.log(`Searching for gate passes with status in: ${pendingStatuses.join(', ')}`);
      
      // Query directly using IN operator with both enum values and lowercase strings
      const gatePasses = await this.gatePassRepository.find({
        where: {
          status: In(pendingStatuses)
        },
        relations: ['student', 'department', 'staff', 'hod', 'academicDirector'],
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
        relations: ['student', 'department', 'staff', 'hod', 'academicDirector', 'security'],
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
  
  // Update gate pass status by Hostel Warden (for hostellers only)
  async updateByHostelWarden(
    gatePassId: number, 
    hostelWardenId: number, 
    updateDto: UpdateGatePassStatusByHostelWardenDto
  ): Promise<GatePass> {
    this.logger.log(`Updating gate pass ${gatePassId} by Hostel Warden ${hostelWardenId}`);
    
    // Find the gate pass
    const gatePass = await this.gatePassRepository.findOne({
      where: { id: gatePassId },
      relations: ['student', 'student.department', 'student.dayScholarHosteller', 'department', 'staff', 'hod']
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
    
    // Verify student is a hosteller
    const dayScholarHostellerType = gatePass.student.dayScholarHosteller?.type?.toLowerCase() || '';
    if (dayScholarHostellerType !== 'hosteller') {
      throw new ForbiddenException('Hostel Warden can only approve gate passes for hostellers');
    }
    
    // Update gate pass
    gatePass.hostelWarden = hostelWarden;
    gatePass.hostel_warden_id = hostelWarden.id;
    gatePass.hostel_warden_comment = updateDto.hostel_warden_comment || '';
    
    if (updateDto.status === 'approved_by_hostel_warden') {
      gatePass.status = GatePassStatus.PENDING_ACADEMIC_DIRECTOR;
    } else {
      gatePass.status = GatePassStatus.REJECTED_BY_HOSTEL_WARDEN;
    }
    
    return this.gatePassRepository.save(gatePass);
  }
  
  // Add a new method to get gate passes for Hostel Warden approval
  async findForHostelWardenApproval(): Promise<GatePass[]> {
    return this.gatePassRepository.find({
      where: { status: GatePassStatus.PENDING_HOSTEL_WARDEN },
      relations: ['student', 'student.department', 'student.dayScholarHosteller', 'department', 'staff', 'hod'],
      order: {
        updated_at: 'ASC'
      }
    });
  }
} 