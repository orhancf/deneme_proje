import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../auth/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Basic health check' })
    async ping() {
        return this.healthService.ping();
    }

    @Get('freshness')
    @ApiOperation({ summary: 'Data freshness report for all fact tables' })
    async getFreshness() {
        return this.healthService.getFreshness();
    }

    @Get('quality')
    @ApiOperation({ summary: 'Recent data quality check results' })
    async getQualityChecks() {
        return this.healthService.getCompletenessChecks();
    }
}
