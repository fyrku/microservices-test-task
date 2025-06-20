import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'production',

  rabbitmq: {
    url:
      process.env.RABBITMQ_URI ||
      (() => {
        throw new Error('RABBITMQ_URI environment variable is required');
      })(),
    exchangeName: process.env.RABBITMQ_EXCHANGE_NAME || 'users_events',
    queueName: process.env.NOTIFICATION_QUEUE_NAME || 'notification_queue',
  },
}));
