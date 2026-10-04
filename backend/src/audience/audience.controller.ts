import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AudienceService } from './audience.service';

@Controller('api')
export class AudienceController {
  constructor(private readonly audienceService: AudienceService) {}

  @Post('segment/webhook')
  async handleWebhook(@Body() payload: any) {
    return this.audienceService.handleSegmentWebhook(payload);
  }

  @Get('audiences')
  async getAudiences() {
    return this.audienceService.getAudiences();
  }

  @Get('audiences/:id/customers')
  async getCustomers(@Param('id') id: string) {
    return this.audienceService.getAudienceCustomers(id);
  }

  @Post('audiences/:id/messages')
  async createMessage(@Param('id') id: string, @Body('content') content: string) {
    return this.audienceService.createMessage(id, content);
  }

  @Get('audiences/:id/messages')
  async getMessages(@Param('id') id: string) {
    return this.audienceService.getMessages(id);
  }

  @Post('audiences/:id/activate')
  async activateAudience(@Param('id') id: string, @Body('messageId') messageId: string) {
    return this.audienceService.activateAudience(id, messageId);
  }
}
