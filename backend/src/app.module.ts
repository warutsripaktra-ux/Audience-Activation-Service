import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AudienceModule } from './audience/audience.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [PrismaModule, AudienceModule, SmsModule],
})
export class AppModule {}
