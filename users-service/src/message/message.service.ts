import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { UserResponseDto } from 'src/users/dto/user';

enum UserEventType {
  UserCreated = 'user.created',
  UserDeleted = 'user.deleted',
}

type UserEvent = {
  eventType: UserEventType;
  userData: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: Date;
};

@Injectable()
export class MessageService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessageService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  private readonly rmqUrl: string;
  private readonly exchangeName: string;

  private isConnectionAlive = false;

  constructor(private readonly configService: ConfigService) {
    this.rmqUrl = this.configService.get<string>('app.rabbitmq.url')!;
    this.exchangeName = this.configService.get<string>(
      'app.rabbitmq.exchangeName',
    )!;
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(this.rmqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      this.isConnectionAlive = true;

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);

        this.isConnectionAlive = false;
      });
    } catch (error) {
      this.logger.error('Error connecting to RabbitMQ', error);

      throw error;
    }
  }

  private async disconnect() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.isConnectionAlive;
  }

  publishUserEvent(event: UserEvent, eventType: UserEventType) {
    if (!this.channel) {
      this.logger.error('Channel is not initialized');
      return;
    }

    try {
      const message = Buffer.from(JSON.stringify(event));

      this.channel.publish(this.exchangeName, eventType, message, {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error(`Error publishing user event: ${eventType}`, error);
      throw error;
    }
  }

  sendUserCreatedMessage(user: UserResponseDto) {
    const event: UserEvent = {
      eventType: UserEventType.UserCreated,
      userData: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      timestamp: new Date(),
    };

    this.publishUserEvent(event, UserEventType.UserCreated);
  }

  sendUserDeletedMessage(user: UserResponseDto) {
    const event: UserEvent = {
      eventType: UserEventType.UserDeleted,
      userData: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      timestamp: new Date(),
    };

    this.publishUserEvent(event, UserEventType.UserDeleted);
  }
}
