import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';
import axios from 'axios';
import { createHmac } from 'crypto';
import * as https from 'https';
import * as querystring from 'querystring';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: any;
  private accountSid: string | undefined;
  private authToken: string | undefined;

  constructor() {
    // Initialize Twilio credentials
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    
    // Log environment variables status (without exposing full sensitive values)
    this.logger.log(`TWILIO_ACCOUNT_SID exists: ${!!this.accountSid} (${this.accountSid ? this.accountSid.substring(0, 6) + '...' : 'undefined'})`);
    this.logger.log(`TWILIO_AUTH_TOKEN exists: ${!!this.authToken} (${this.authToken ? this.authToken.substring(0, 4) + '...' : 'undefined'})`);
    this.logger.log(`TWILIO_PHONE_NUMBER exists: ${!!fromPhone} (${fromPhone || 'undefined'})`);
    
    if (this.accountSid && this.authToken) {
      try {
        this.client = twilio(this.accountSid, this.authToken);
        this.logger.log('Twilio client initialized successfully');
      } catch (error) {
        this.logger.error(`Failed to initialize Twilio client: ${error.message}`);
        this.client = null;
      }
    } else {
      this.logger.warn('Twilio credentials not found in environment variables');
    }
  }

  /**
   * Send an SMS notification to a parent when their child leaves campus
   * @param phoneNumber The parent's phone number (with country code)
   * @param studentName The student's name
   * @param time The time when the student left campus
   * @returns Promise with the Twilio response or null if sending failed
   */
  async sendParentExitNotification(
    phoneNumber: string,
    studentName: string,
    time: Date
  ): Promise<any> {
    this.logger.log(`Attempting to send SMS to parent (${phoneNumber}, raw type: ${typeof phoneNumber}) for student: ${studentName}`);
    this.logger.log(`Raw phone number value: "${phoneNumber}"`);
    
    if (!this.accountSid || !this.authToken) {
      this.logger.warn('Twilio credentials not available, skipping SMS notification');
      return null;
    }

    if (!phoneNumber) {
      this.logger.warn('No parent phone number provided, skipping SMS notification');
      return null;
    }

    try {
      // Format time in a readable format
      const formattedTime = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      const formattedDate = time.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      // Creating a simpler message for testing
      const message = `IMPORTANT: Your child ${studentName} has left the college campus at ${formattedTime} on ${formattedDate}. - College Management`;

      // Normalize phone number
      const normalizedPhoneNumber = this.normalizePhoneNumber(phoneNumber);
      this.logger.log(`Sending SMS to ${normalizedPhoneNumber} for student ${studentName}`);
      
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!fromNumber) {
        this.logger.warn('No Twilio phone number configured, skipping SMS notification');
        return null;
      }
      
      this.logger.log(`Request params: To=${normalizedPhoneNumber}, From=${fromNumber}, Message length=${message.length}`);
      
      // Try using the manual NodeJS https module
      return await this.sendSmsWithNodeHttps(normalizedPhoneNumber, fromNumber, message);
      
    } catch (error) {
      // Log the error but don't throw it - this shouldn't affect the main function
      this.logger.error(`Failed to send SMS: ${error.message}`);
      if (error.stack) {
        this.logger.error(`Error stack: ${error.stack.substring(0, 500)}`);
      }
      return null;
    }
  }

  /**
   * Send SMS using Node.js built-in https module
   */
  private sendSmsWithNodeHttps(to: string, from: string, body: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.accountSid || !this.authToken) {
        reject(new Error('Missing Twilio credentials'));
        return;
      }

      // Prepare the data
      const postData = querystring.stringify({
        To: to,
        From: from,
        Body: body
      });

      // Prepare request options
      const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
        }
      };

      this.logger.log(`Making direct HTTPS request to Twilio API: ${options.hostname}${options.path}`);

      // Create request
      const req = https.request(options, (res) => {
        this.logger.log(`Twilio API response status: ${res.statusCode}`);
        
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const jsonResponse = JSON.parse(responseData);
              this.logger.log(`SMS sent successfully via HTTPS, SID: ${jsonResponse.sid}`);
              resolve(jsonResponse);
            } catch (e) {
              this.logger.error(`Failed to parse Twilio API response: ${e.message}`);
              this.logger.log(`Raw response: ${responseData.substring(0, 500)}`);
              reject(e);
            }
          } else {
            this.logger.error(`Twilio API error: ${res.statusCode}`);
            this.logger.error(`Response data: ${responseData}`);
            reject(new Error(`HTTP Error: ${res.statusCode} - ${responseData}`));
          }
        });
      });

      req.on('error', (e) => {
        this.logger.error(`HTTPS request error: ${e.message}`);
        reject(e);
      });

      // Write data to request body
      req.write(postData);
      req.end();
    });
  }

  /**
   * Normalize phone number to ensure it has the country code
   * @param phoneNumber The phone number to normalize
   * @returns Normalized phone number
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // Log the input for debugging
    this.logger.log(`Normalizing phone number: "${phoneNumber}", type: ${typeof phoneNumber}`);
    
    // Handle null or undefined
    if (!phoneNumber) {
      return '';
    }
    
    // Convert to string if not already
    const phoneStr = String(phoneNumber);
    
    // Remove any non-digit characters
    let normalized = phoneStr.replace(/\D/g, '');
    
    this.logger.log(`After removing non-digits: "${normalized}"`);
    
    // If empty after normalization, return empty string
    if (!normalized) {
      return '';
    }
    
    // Ensure India country code for Indian numbers
    if (!phoneStr.startsWith('+')) {
      // For 10-digit Indian numbers, add country code
      if (normalized.length === 10) {
        normalized = '+91' + normalized;
        this.logger.log(`Added India country code: "${normalized}"`);
      } 
      // If it already has the country code (91) without +, add +
      else if (normalized.startsWith('91') && normalized.length >= 12) {
        normalized = '+' + normalized;
        this.logger.log(`Added + prefix: "${normalized}"`);
      }
      // For Indian numbers missing country code but not 10 digits
      else if (normalized.length > 0 && normalized.length < 10) {
        // Pad with zeros if less than 10 digits (for testing only)
        while (normalized.length < 10) {
          normalized = '0' + normalized;
        }
        normalized = '+91' + normalized;
        this.logger.log(`Padded and added country code: "${normalized}"`);
      }
      // For any other format, add +91 prefix
      else if (normalized.length > 0) {
        normalized = '+91' + normalized;
        this.logger.log(`Added default country code: "${normalized}"`);
      }
    }
    
    this.logger.log(`Final normalized phone number: "${normalized}"`);
    return normalized;
  }
} 