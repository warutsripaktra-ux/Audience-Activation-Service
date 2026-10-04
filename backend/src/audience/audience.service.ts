import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AudienceService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
  ) {}

  async handleSegmentWebhook(payload: any) {
    // Basic implementation for handling Twilio Segment webhook
    // Assuming Segment sends Identify or Track event
    if (payload.type === 'identify') {
      const traits = payload.traits;
      const segmentId = payload.userId || payload.anonymousId;
      const audienceName = traits.audience || 'Default Audience';
      
      let audience = await this.prisma.audience.findUnique({
        where: { name: audienceName }
      });
      
      if (!audience) {
        audience = await this.prisma.audience.create({
          data: { name: audienceName }
        });
      }

      await this.prisma.customer.upsert({
        where: { segmentId },
        update: {
          name: traits.name,
          phone: traits.phone,
          audienceId: audience.id,
        },
        create: {
          segmentId,
          name: traits.name,
          phone: traits.phone,
          audienceId: audience.id,
        }
      });
    }
    return { success: true };
  }

  async getAudiences() {
    return this.prisma.audience.findMany({
      include: {
        _count: {
          select: { customers: true }
        }
      }
    });
  }

  async getAudienceCustomers(audienceId: string) {
    return this.prisma.customer.findMany({
      where: { audienceId },
      include: {
        activations: true
      }
    });
  }

  async createMessage(audienceId: string, content: string) {
    return this.prisma.message.create({
      data: {
        content,
        audienceId
      }
    });
  }

  async getMessages(audienceId: string) {
    return this.prisma.message.findMany({
      where: { audienceId }
    });
  }

  async activateAudience(audienceId: string, messageId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { audienceId }
    });
    
    const message = await this.prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) throw new Error('Message not found');

    const activations = await Promise.all(customers.map(customer => 
      this.prisma.activation.create({
        data: {
          status: 'PENDING',
          customerId: customer.id,
          messageId: message.id
        }
      })
    ));

    // Process asynchronously
    this.processActivations(activations, customers, message.content);

    return { message: 'Activation started', count: customers.length };
  }

  private async processActivations(activations: any[], customers: any[], content: string) {
    for (let i = 0; i < activations.length; i++) {
      const activation = activations[i];
      const customer = customers.find(c => c.id === activation.customerId);
      
      if (!customer || !customer.phone) {
        await this.prisma.activation.update({
          where: { id: activation.id },
          data: { status: 'FAILED' }
        });
        continue;
      }

      await this.prisma.activation.update({
        where: { id: activation.id },
        data: { status: 'PROCESSING' }
      });

      const success = await this.smsService.sendSms(customer.phone, content);

      await this.prisma.activation.update({
        where: { id: activation.id },
        data: { status: success ? 'SUCCESS' : 'FAILED' }
      });
    }
  }
}
