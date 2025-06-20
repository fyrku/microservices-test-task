import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, NotificationModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
