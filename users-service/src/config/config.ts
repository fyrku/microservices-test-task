import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'production',

  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/users',
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
    exchangeName: process.env.USERS_EXCHANGE_NAME || 'users_events',
  },
}));
