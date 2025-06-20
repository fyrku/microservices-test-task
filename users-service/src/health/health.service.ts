import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';
import { MessageService } from '../message/message.service';

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

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly messageService: MessageService,
  ) {}

  async getHealth(): Promise<HealthStatus> {
    const checks: HealthCheck[] = await Promise.all([
      this.checkDatabase(),
      this.checkRabbitMQ(),
    ]);

    const hasDown = checks.some((check) => check.status === 'down');

    return {
      status: hasDown ? 'unhealthy' : 'healthy',
      timestamp: new Date(),
      service: 'users-service',
      checks,
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    try {
      if (this.mongoConnection.readyState !== ConnectionStates.connected) {
        return {
          name: 'mongodb',
          status: 'down',
          message: 'Database not connected',
        };
      }

      await this.mongoConnection.db?.admin().ping();

      return {
        name: 'mongodb',
        status: 'up',
        message: 'Database connected and responsive',
      };
    } catch (error) {
      return {
        name: 'mongodb',
        status: 'down',
        message: `Database error: ${JSON.stringify(error)}`,
      };
    }
  }

  private checkRabbitMQ(): HealthCheck {
    const isConnected = this.messageService.isConnected();

    return {
      name: 'rabbitmq',
      status: isConnected ? 'up' : 'down',
      message: isConnected
        ? 'RabbitMQ connected and operational'
        : 'RabbitMQ connection unavailable',
    };
  }
}
