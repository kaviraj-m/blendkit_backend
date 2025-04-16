import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { GatePass, GatePassStatus } from '../entities/gate-pass.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor() {
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'tamilankaviraj@gmail.com',
        pass: 'juma emjp nxjk vppv' // app password for Gmail
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email service failed to initialize', error);
      } else {
        this.logger.log('Email service is ready to send messages');
      }
    });
  }

  /**
   * Send gate pass notification to student
   */
  async sendGatePassStudentNotification(gatePass: GatePass, student: User): Promise<void> {
    try {
      const subject = `Gate Pass #${gatePass.id} Status Update`;
      
      // Determine the status message based on the gate pass status
      let statusMessage = 'has been updated';
      if (gatePass.status === GatePassStatus.APPROVED) {
        statusMessage = 'has been APPROVED';
      } else if (
        gatePass.status === GatePassStatus.REJECTED_BY_STAFF ||
        gatePass.status === GatePassStatus.REJECTED_BY_HOD ||
        gatePass.status === GatePassStatus.REJECTED_BY_HOSTEL_WARDEN ||
        gatePass.status === GatePassStatus.REJECTED_BY_ACADEMIC_DIRECTOR
      ) {
        statusMessage = 'has been REJECTED';
      }
      
      const html = `
        <h2>Gate Pass Status Update</h2>
        <p>Dear ${student.name},</p>
        <p>Your gate pass request (ID: ${gatePass.id}) ${statusMessage}.</p>
        <p><strong>Type:</strong> ${gatePass.type}</p>
        <p><strong>Reason:</strong> ${gatePass.reason}</p>
        <p><strong>Dates:</strong> ${new Date(gatePass.start_date).toLocaleDateString()} to ${new Date(gatePass.end_date).toLocaleDateString()}</p>
        <p><strong>Current Status:</strong> ${gatePass.status}</p>
        ${gatePass.staff_comment ? `<p><strong>Staff Comment:</strong> ${gatePass.staff_comment}</p>` : ''}
        ${gatePass.hod_comment ? `<p><strong>HOD Comment:</strong> ${gatePass.hod_comment}</p>` : ''}
        ${gatePass.academic_director_comment ? `<p><strong>Academic Director Comment:</strong> ${gatePass.academic_director_comment}</p>` : ''}
        <p>Please log in to the system for more details.</p>
        <p>Thank you.</p>
      `;

      await this.sendEmail(student.email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send student notification for gate pass ${gatePass.id}`, error);
    }
  }

  /**
   * Send gate pass notification to staff
   */
  async sendGatePassStaffNotification(gatePass: GatePass, staff: User): Promise<void> {
    try {
      const subject = `Gate Pass #${gatePass.id} Pending Your Approval`;
      const html = `
        <h2>Gate Pass Approval Required</h2>
        <p>Dear ${staff.name},</p>
        <p>A new gate pass (ID: ${gatePass.id}) requires your approval.</p>
        <p><strong>Student:</strong> ${gatePass.student?.name || 'Student #' + gatePass.student_id}</p>
        <p><strong>Type:</strong> ${gatePass.type}</p>
        <p><strong>Reason:</strong> ${gatePass.reason}</p>
        <p><strong>Dates:</strong> ${new Date(gatePass.start_date).toLocaleDateString()} to ${new Date(gatePass.end_date).toLocaleDateString()}</p>
        <p>Please log in to the system to review and respond to this request.</p>
        <p>Thank you.</p>
      `;

      await this.sendEmail(staff.email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send staff notification for gate pass ${gatePass.id}`, error);
    }
  }

  /**
   * Send gate pass notification to HOD
   */
  async sendGatePassHodNotification(gatePass: GatePass, hod: User): Promise<void> {
    try {
      const subject = `Gate Pass #${gatePass.id} Pending Your Approval`;
      const html = `
        <h2>Gate Pass Approval Required</h2>
        <p>Dear ${hod.name},</p>
        <p>A gate pass (ID: ${gatePass.id}) has been approved by staff and now requires your approval.</p>
        <p><strong>Student:</strong> ${gatePass.student?.name || 'Student #' + gatePass.student_id}</p>
        <p><strong>Type:</strong> ${gatePass.type}</p>
        <p><strong>Reason:</strong> ${gatePass.reason}</p>
        <p><strong>Staff Comment:</strong> ${gatePass.staff_comment || 'No comment provided'}</p>
        <p><strong>Dates:</strong> ${new Date(gatePass.start_date).toLocaleDateString()} to ${new Date(gatePass.end_date).toLocaleDateString()}</p>
        <p>Please log in to the system to review and respond to this request.</p>
        <p>Thank you.</p>
      `;

      await this.sendEmail(hod.email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send HOD notification for gate pass ${gatePass.id}`, error);
    }
  }

  /**
   * Send gate pass notification to Academic Director
   */
  async sendGatePassAcademicDirectorNotification(gatePass: GatePass, academicDirector: User): Promise<void> {
    try {
      const subject = `Gate Pass #${gatePass.id} Pending Your Approval`;
      const html = `
        <h2>Gate Pass Approval Required</h2>
        <p>Dear ${academicDirector.name},</p>
        <p>A gate pass (ID: ${gatePass.id}) has been approved by HOD and now requires your final approval.</p>
        <p><strong>Student:</strong> ${gatePass.student?.name || 'Student #' + gatePass.student_id}</p>
        <p><strong>Type:</strong> ${gatePass.type}</p>
        <p><strong>Reason:</strong> ${gatePass.reason}</p>
        <p><strong>Department:</strong> ${gatePass.department?.name || 'Department #' + gatePass.department_id}</p>
        <p><strong>HOD Comment:</strong> ${gatePass.hod_comment || 'No comment provided'}</p>
        <p><strong>Dates:</strong> ${new Date(gatePass.start_date).toLocaleDateString()} to ${new Date(gatePass.end_date).toLocaleDateString()}</p>
        <p>Please log in to the system to review and respond to this request.</p>
        <p>Thank you.</p>
      `;

      await this.sendEmail(academicDirector.email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send Academic Director notification for gate pass ${gatePass.id}`, error);
    }
  }

  /**
   * Send gate pass notification to Hostel Warden
   */
  async sendGatePassHostelWardenNotification(gatePass: GatePass, hostelWarden: User): Promise<void> {
    try {
      const subject = `Gate Pass #${gatePass.id} Pending Your Approval`;
      const html = `
        <h2>Gate Pass Approval Required</h2>
        <p>Dear ${hostelWarden.name},</p>
        <p>A gate pass (ID: ${gatePass.id}) has been approved by HOD and now requires your approval.</p>
        <p><strong>Student:</strong> ${gatePass.student?.name || 'Student #' + gatePass.student_id}</p>
        <p><strong>Type:</strong> ${gatePass.type}</p>
        <p><strong>Reason:</strong> ${gatePass.reason}</p>
        <p><strong>Department:</strong> ${gatePass.department?.name || 'Department #' + gatePass.department_id}</p>
        <p><strong>HOD Comment:</strong> ${gatePass.hod_comment || 'No comment provided'}</p>
        <p><strong>Dates:</strong> ${new Date(gatePass.start_date).toLocaleDateString()} to ${new Date(gatePass.end_date).toLocaleDateString()}</p>
        <p>Please log in to the system to review and respond to this request.</p>
        <p>Thank you.</p>
      `;

      await this.sendEmail(hostelWarden.email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send Hostel Warden notification for gate pass ${gatePass.id}`, error);
    }
  }

  /**
   * Generic method to send emails
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const mailOptions = {
        from: '"BlendKit Gate Pass System" <tamilankaviraj@gmail.com>',
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw error;
    }
  }
} 