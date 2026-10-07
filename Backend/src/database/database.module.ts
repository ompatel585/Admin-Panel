import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { AppConfig } from '../config/configuration.js';
import { LegacyIndexCleanupService } from './legacy-index-cleanup.service.js';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        uri: config.get('database.uri', { infer: true }),
      }),
    }),
  ],
  providers: [LegacyIndexCleanupService],
})
export class DatabaseModule {}
