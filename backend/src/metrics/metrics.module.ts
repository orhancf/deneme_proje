import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { CacheService } from '../common/cache.service';

@Module({
    imports: [AuditModule],
    controllers: [MetricsController],
    providers: [MetricsService, CacheService],
})
export class MetricsModule { }
