import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Channel, ChannelModel } from 'amqplib';

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
    createdAt: Date;
  };
  timestamp: Date;
};

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  private readonly rmqUrl: string;
  private readonly exchangeName: string;
  private readonly queueName: string;

  private isConnectionAlive = false;

  constructor(private readonly configService: ConfigService) {
    this.rmqUrl = this.configService.get<string>('app.rabbitmq.url')!;
    this.exchangeName = this.configService.get<string>(
      'app.rabbitmq.exchangeName',
    )!;
    this.queueName = this.configService.get<string>('app.rabbitmq.queueName')!;
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.logger.log(`Connecting to RabbitMQ at ${this.rmqUrl}`);

      this.connection = await amqp.connect(this.rmqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });

      for (const eventType of Object.values(UserEventType)) {
        await this.channel.bindQueue(
          this.queueName,
          this.exchangeName,
          eventType,
        );
      }

      await this.channel.prefetch(1);

      await this.channel.consume(this.queueName, (msg) => {
        if (msg) {
          void this.handleMessage(msg);
        }
      });

      this.isConnectionAlive = true;

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);

        this.isConnectionAlive = false;
      });

      this.logger.log(
        `Connected to RabbitMQ and listening for messages on queue: ${this.queueName}`,
      );
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
    }
  }

  isConnected(): boolean {
    return this.isConnectionAlive;
  }

  private handleMessage(msg: amqp.ConsumeMessage) {
    try {
      const content = msg.content.toString();
      const event = JSON.parse(content) as UserEvent;
      const eventType = event.eventType;

      switch (eventType) {
        case UserEventType.UserCreated:
          this.handleUserCreatedEvent(event);
          break;
        case UserEventType.UserDeleted:
          this.handleUserDeletedEvent(event);
          break;
        default:
          this.logger.warn(`Unhandled event type: ${eventType as string}`);
      }

      this.channel?.ack(msg);
    } catch (error) {
      this.logger.error('Error handling message', error);

      this.channel?.nack(msg, false, true);
    }
  }

  private handleUserCreatedEvent(event: UserEvent) {
    this.logger.log(`------------------------------------------`);
    this.logger.log(`User created: ${JSON.stringify(event.userData)}`);
    this.logger.log(`------------------------------------------`);
  }

  private handleUserDeletedEvent(event: UserEvent) {
    this.logger.log(`------------------------------------------`);
    this.logger.log(`User deleted: ${JSON.stringify(event.userData)}`);
    this.logger.log(`------------------------------------------`);
  }
}
