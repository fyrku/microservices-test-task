import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

type HealthStatus = {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  service: string;
  checks: HealthCheck[];
};

type HealthCheck = {
  name: string;
  status: 'up' | 'down';
  message?: string;
};

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly notificationService: NotificationService) {}

  async getHealth(): Promise<HealthStatus> {
    const checks: HealthCheck[] = await Promise.all([this.checkRabbitMQ()]);

    const hasDown = checks.some((check) => check.status === 'down');

    return {
      status: hasDown ? 'unhealthy' : 'healthy',
      timestamp: new Date(),
      service: 'notification-service',
      checks,
    };
  }

  private checkRabbitMQ(): HealthCheck {
    const isConnected = this.notificationService.isConnected();

    return {
      name: 'rabbitmq',
      status: isConnected ? 'up' : 'down',
      message: isConnected
        ? 'RabbitMQ connected and operational'
        : 'RabbitMQ connection unavailable',
    };
  }
}
