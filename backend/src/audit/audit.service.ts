import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly db: DatabaseService) { }

    async log(params: {
        userId?: string;
        action: string;
        resource?: string;
        details?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void> {
        await this.db.query(
            `INSERT INTO app.audit_log (user_id, action, resource, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5::inet, $6)`,
            [params.userId || null, params.action, params.resource || null,
            params.details ? JSON.stringify(params.details) : null,
            params.ipAddress || null, params.userAgent || null],
        );
    }

    async getRecentLogs(limit: number = 100): Promise<any[]> {
        const { rows } = await this.db.query(
            `SELECT al.*, u.email, u.display_name
       FROM app.audit_log al
       LEFT JOIN app.app_user u ON al.user_id = u.user_id
       ORDER BY al.created_at DESC
       LIMIT $1`,
            [limit],
        );
        return rows;
    }
}
