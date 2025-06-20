import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'production',

  database: {
    uri:
      process.env.MONGO_URI ||
      (() => {
        throw new Error('MONGO_URI environment variable is required');
      })(),
  },

  rabbitmq: {
    url:
      process.env.RABBITMQ_URI ||
      (() => {
        throw new Error('RABBITMQ_URI environment variable is required');
      })(),
    exchangeName: process.env.USERS_EXCHANGE_NAME || 'users_events',
  },
}));
