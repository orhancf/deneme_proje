import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../common/cache.service';

export interface FreshnessResult {
    table_name: string;
    last_load: string;
    row_count: number;
    sla_status: 'GREEN' | 'YELLOW' | 'RED';
    hours_since_load: number;
}

@Injectable()
export class HealthService {
    constructor(
        private readonly db: DatabaseService,
        private readonly cache: CacheService,
    ) { }

    async getFreshness(): Promise<FreshnessResult[]> {
        const cached = this.cache.get<FreshnessResult[]>('freshness');
        if (cached) return cached;

        const { rows } = await this.db.query(`
      SELECT
        table_name,
        last_load,
        row_count,
        EXTRACT(EPOCH FROM (NOW() - last_load)) / 3600 AS hours_since_load
      FROM analytics.v_data_freshness
    `);

        const results: FreshnessResult[] = rows.map((r: any) => ({
            table_name: r.table_name,
            last_load: r.last_load,
            row_count: parseInt(r.row_count),
            hours_since_load: parseFloat(parseFloat(r.hours_since_load).toFixed(1)),
            sla_status: r.hours_since_load <= 24 ? 'GREEN' : r.hours_since_load <= 48 ? 'YELLOW' : 'RED',
        }));

        this.cache.set('freshness', results, 120); // cache 2 min
        return results;
    }

    async getCompletenessChecks(): Promise<any[]> {
        const { rows } = await this.db.query(`
      SELECT check_name, check_type, target_table, status, metric_value, threshold, checked_at
      FROM app.data_quality_log
      ORDER BY checked_at DESC
      LIMIT 50
    `);
        return rows;
    }

    async ping(): Promise<{ status: string; timestamp: string }> {
        await this.db.query('SELECT 1');
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
