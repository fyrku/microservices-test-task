import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port')!;
  const host = configService.get<string>('app.host')!;

  await app.listen(port, host);
}
bootstrap().catch((error) => {
  console.error('Error when starting notification-service:', error);

  process.exit(1);
});
