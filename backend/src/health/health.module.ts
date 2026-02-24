import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { CacheService } from '../common/cache.service';

@Module({
    controllers: [HealthController],
    providers: [HealthService, CacheService],
})
export class HealthModule { }
