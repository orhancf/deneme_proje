import { Controller, Get, Post, Param, Body, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { MetricsService, MetricQueryDto } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Get()
    @ApiOperation({ summary: 'List all KPIs from the catalog' })
    async getCatalog() {
        return this.metricsService.getCatalog();
    }

    @Get(':kpiId')
    @ApiOperation({ summary: 'Get single KPI definition' })
    @ApiParam({ name: 'kpiId', example: 'OTIF_001' })
    async getKpi(@Param('kpiId') kpiId: string) {
        const kpi = await this.metricsService.getKpiById(kpiId);
        if (!kpi) throw new NotFoundException(`KPI ${kpiId} not found`);
        return kpi;
    }

    @Post('query')
    @ApiOperation({ summary: 'Query a metric with dimensions and filters' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                kpiId: { type: 'string', example: 'OTIF_001' },
                timeRange: {
                    type: 'object',
                    properties: {
                        start: { type: 'string', example: '2025-01-01' },
                        end: { type: 'string', example: '2025-12-31' },
                    },
                },
                filters: {
                    type: 'object',
                    example: { org_id: 'PLT-01' },
                },
                limit: { type: 'number', example: 500 },
            },
        },
    })
    async queryMetric(@Req() req: any, @Body() dto: MetricQueryDto) {
        return this.metricsService.queryMetric(dto, req.user?.id, req.user?.role);
    }
}
