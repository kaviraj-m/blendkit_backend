import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint, ComplaintStatus } from '../entities/complaint.entity';
import { CreateComplaintDto, UpdateComplaintStatusDto } from './dto/complaint.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);
  
  constructor(
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(studentId: number, createComplaintDto: CreateComplaintDto): Promise<Complaint> {
    this.logger.log(`Creating complaint for student ID: ${studentId}`);
    
    if (!studentId) {
      this.logger.error(`Invalid student ID: ${studentId}`);
      throw new NotFoundException('Valid student ID is required');
    }
    
    const student = await this.userRepository.findOne({ where: { id: studentId } });
    if (!student) {
      this.logger.error(`Student not found with ID: ${studentId}`);
      throw new NotFoundException('Student not found');
    }

    const complaint = new Complaint();
    complaint.student = student;
    complaint.subject = createComplaintDto.subject;
    complaint.message = createComplaintDto.message;
    complaint.status = ComplaintStatus.PENDING;

    const savedComplaint = await this.complaintRepository.save(complaint);
    this.logger.log(`Complaint created with ID: ${savedComplaint.id}`);
    return savedComplaint;
  }

  async findAll(): Promise<Complaint[]> {
    return this.complaintRepository.find({
      relations: ['student', 'director'],
      order: { created_at: 'DESC' }
    });
  }

  async findByStudent(studentId: number): Promise<Complaint[]> {
    return this.complaintRepository.find({
      where: { student: { id: studentId } },
      relations: ['student', 'director'],
      order: { created_at: 'DESC' }
    });
  }

  async findByStatus(status: ComplaintStatus): Promise<Complaint[]> {
    return this.complaintRepository.find({
      where: { status },
      relations: ['student', 'director'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Complaint> {
    this.logger.log(`Finding complaint with ID: ${id}`);
    
    if (!id || isNaN(id)) {
      this.logger.error(`Invalid complaint ID: ${id}`);
      throw new NotFoundException(`Invalid complaint ID`);
    }
    
    const complaint = await this.complaintRepository.findOne({
      where: { id },
      relations: ['student', 'director']
    });
    
    if (!complaint) {
      this.logger.error(`Complaint with ID ${id} not found`);
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }
    
    return complaint;
  }

  async updateStatus(id: number, directorId: number, updateStatusDto: UpdateComplaintStatusDto) {
    this.logger.log(`Updating complaint ${id} status to ${updateStatusDto.status} by director ${directorId}`);
    
    // Validate complaint exists
    const complaint = await this.findOne(id);
    if (!complaint) {
      this.logger.error(`Complaint with ID ${id} not found`);
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }
    
    // Validate director exists
    const director = await this.userRepository.findOne({ where: { id: directorId } });
    if (!director) {
      this.logger.error(`Director with ID ${directorId} not found`);
      throw new NotFoundException(`Director with ID ${directorId} not found`);
    }
    
    // Update complaint
    complaint.status = updateStatusDto.status;
    complaint.response = updateStatusDto.response;
    complaint.director = director;
    
    this.logger.log(`Successfully updated complaint ${id}`);
    return this.complaintRepository.save(complaint);
  }

  async findByDepartment(departmentId: number): Promise<Complaint[]> {
    this.logger.log(`Finding complaints for department ID: ${departmentId}`);
    
    if (!departmentId) {
      this.logger.error(`Invalid department ID: ${departmentId}`);
      throw new NotFoundException('Valid department ID is required');
    }
    
    return this.complaintRepository.createQueryBuilder('complaint')
      .innerJoinAndSelect('complaint.student', 'student')
      .leftJoinAndSelect('complaint.director', 'director')
      .where('student.department_id = :departmentId', { departmentId })
      .orderBy('complaint.created_at', 'DESC')
      .getMany();
  }

  async findByHostel(wardenId: number): Promise<Complaint[]> {
    this.logger.log(`Finding complaints for warden ID: ${wardenId}`);
    
    if (!wardenId) {
      this.logger.error(`Invalid warden ID: ${wardenId}`);
      throw new NotFoundException('Valid warden ID is required');
    }
    
    // Get the warden to find associated hostel information
    const warden = await this.userRepository.findOne({ where: { id: wardenId } });
    
    if (!warden) {
      this.logger.error(`Warden not found with ID: ${wardenId}`);
      throw new NotFoundException('Warden not found');
    }
    
    // Find students who are hostellers (dayscholar_hosteller_id = 2)
    // This assumes that hosteller ID is 2, adjust as needed for your schema
    return this.complaintRepository.createQueryBuilder('complaint')
      .innerJoinAndSelect('complaint.student', 'student')
      .leftJoinAndSelect('complaint.director', 'director')
      .where('student.dayscholar_hosteller_id = :hostellerId', { hostellerId: 2 })
      .orderBy('complaint.created_at', 'DESC')
      .getMany();
  }
} 