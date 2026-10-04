import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  async sendSms(phone: string, message: string): Promise<boolean> {
    // Mock SMS API behavior
    console.log(`Sending SMS to ${phone}: ${message}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        const isSuccess = Math.random() > 0.1;
        resolve(isSuccess);
      }, 500); // simulate network delay
    });
  }
}
