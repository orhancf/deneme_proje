import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MetricsModule } from './metrics/metrics.module';
import { DimensionsModule } from './dimensions/dimensions.module';
import { HealthModule } from './health/health.module';
import { AuditModule } from './audit/audit.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        MetricsModule,
        DimensionsModule,
        HealthModule,
        AuditModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        }
    ]
})
export class AppModule { }
