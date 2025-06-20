import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'production',

  database: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/notification',
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
    exchangeName: process.env.RABBITMQ_EXCHANGE_NAME || 'notifications',
    queueName: process.env.NOTIFICATION_QUEUE_NAME || 'notification_queue',
  },
}));
