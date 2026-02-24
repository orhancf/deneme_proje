import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../auth/roles.decorator';

@ApiTags('audit')
@Controller('audit')
@Roles('ADMIN')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    @ApiOperation({ summary: 'Get recent audit log entries' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getRecent(@Query('limit') limit?: string) {
        return this.auditService.getRecentLogs(limit ? parseInt(limit) : 100);
    }

    @Post()
    @ApiOperation({ summary: 'Log an action from the frontend' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                action: { type: 'string', example: 'EXPORT' },
                resource: { type: 'string', example: 'Dashboard: Command Center' },
                details: { type: 'object' },
            }
        }
    })
    async logAction(@Req() req: any, @Body() body: any) {
        return this.auditService.log({
            userId: req.user?.id,
            action: body.action,
            resource: body.resource,
            details: body.details,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
    }
}
