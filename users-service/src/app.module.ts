import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('app.database.uri'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    HealthModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
