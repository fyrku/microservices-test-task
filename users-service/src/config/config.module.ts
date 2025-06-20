import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import config from './config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      cache: true,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
