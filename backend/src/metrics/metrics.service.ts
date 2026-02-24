import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../common/cache.service';
import { AuditService } from '../audit/audit.service';

export interface KpiDefinition {
    kpi_id: string;
    name: string;
    description: string;
    owner: string;
    business_question: string;
    formula_business: string;
    formula_sql: string | null;
    unit: string;
    grain: string;
    dimensions: string[];
    refresh_sla: string;
    source_tables: string[];
    thresholds: Record<string, number>;
    is_active: boolean;
}

export interface MetricQueryDto {
    kpiId: string;
    grain?: string;
    dimensions?: string[];
    filters?: Record<string, string | string[]>;
    timeRange?: { start: string; end: string };
    limit?: number;
}

@Injectable()
export class MetricsService {
    private readonly logger = new Logger(MetricsService.name);

    // Maps kpi_id to SQL view name
    private readonly kpiViewMap: Record<string, string> = {
        OTIF_001: 'analytics.v_kpi_otif',
        OTD_002: 'analytics.v_kpi_otif',
        FILL_003: 'analytics.v_kpi_otif',
        BACKLOG_004: 'analytics.v_kpi_backlog',
        DOH_005: 'analytics.v_kpi_inventory',
        TURNS_006: 'analytics.v_kpi_inventory_turns',
        STOCKOUT_007: 'analytics.v_kpi_inventory',
        EO_008: 'analytics.v_kpi_inventory',
        FCACC_009: 'analytics.v_kpi_forecast',
        FCBIAS_010: 'analytics.v_kpi_forecast',
        SCHEDADH_011: 'analytics.v_kpi_production',
        CAPUTIL_012: 'analytics.v_kpi_production',
        SUPOT_013: 'analytics.v_kpi_supplier',
        LTVAR_014: 'analytics.v_kpi_supplier',
        SUPPPM_015: 'analytics.v_kpi_supplier',
        FRCOST_016: 'analytics.v_kpi_logistics',
        TTVAR_017: 'analytics.v_kpi_logistics',
        CAROT_018: 'analytics.v_kpi_logistics',
    };

    // Maps kpi_id to value column for aggregation
    private readonly kpiValueCol: Record<string, string> = {
        OTIF_001: 'otif_pct',
        OTD_002: 'otd_pct',
        FILL_003: 'fill_rate_pct',
        BACKLOG_004: 'backlog_qty',
        DOH_005: 'days_on_hand',
        TURNS_006: 'avg_doh',
        STOCKOUT_007: 'is_stockout',
        EO_008: 'inventory_value',
        FCACC_009: 'pct_error',
        FCBIAS_010: 'bias',
        SCHEDADH_011: 'schedule_adherence',
        CAPUTIL_012: 'capacity_utilization',
        SUPOT_013: 'supplier_ot_pct',
        LTVAR_014: 'avg_lead_time_variance',
        SUPPPM_015: 'avg_quality_ppm',
        FRCOST_016: 'freight_cost_per_unit',
        TTVAR_017: 'avg_transit_variance',
        CAROT_018: 'carrier_ot_pct',
    };

    constructor(
        private readonly db: DatabaseService,
        private readonly cache: CacheService,
        private readonly audit: AuditService,
    ) { }

    async getCatalog(): Promise<KpiDefinition[]> {
        const cached = this.cache.get<KpiDefinition[]>('kpi_catalog');
        if (cached) return cached;

        const { rows } = await this.db.query<KpiDefinition>(
            'SELECT * FROM app.kpi_catalog WHERE is_active = true ORDER BY kpi_id',
        );
        this.cache.set('kpi_catalog', rows, 300); // 5 min
        return rows;
    }

    async getKpiById(kpiId: string): Promise<KpiDefinition | null> {
        const catalog = await this.getCatalog();
        return catalog.find((k) => k.kpi_id === kpiId) || null;
    }

    async queryMetric(dto: MetricQueryDto, userId?: string, userRole?: string): Promise<{ series: any[]; summary: Record<string, any> }> {
        const cacheKey = `query:${JSON.stringify(dto)}:${userId || 'anon'}`;
        const cached = this.cache.get<any>(cacheKey);
        if (cached) return cached;

        const viewName = this.kpiViewMap[dto.kpiId];
        if (!viewName) {
            throw new Error(`Unknown KPI: ${dto.kpiId}`);
        }

        // Build WHERE clauses
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        // Time range filter
        if (dto.timeRange) {
            // Try to find a date column in the view
            const dateCol = this.getDateColumn(dto.kpiId);
            if (dateCol) {
                conditions.push(`${dateCol} >= $${paramIdx}`);
                params.push(dto.timeRange.start);
                paramIdx++;
                conditions.push(`${dateCol} <= $${paramIdx}`);
                params.push(dto.timeRange.end);
                paramIdx++;
            }
        }

        // Dimension filters
        if (dto.filters) {
            for (const [key, value] of Object.entries(dto.filters)) {
                const safeKey = key.replace(/[^a-z_]/gi, ''); // sanitize
                if (Array.isArray(value)) {
                    conditions.push(`${safeKey} = ANY($${paramIdx})`);
                    params.push(value);
                } else {
                    conditions.push(`${safeKey} = $${paramIdx}`);
                    params.push(value);
                }
                paramIdx++;
            }
        }

        const limit = dto.limit || 1000;

        // Row-Level Security
        if (userId && userRole !== 'ADMIN') {
            const { rows: accessRows } = await this.db.query('SELECT org_id FROM app.user_org_access WHERE user_id = $1', [userId]);
            const allowedOrgs = accessRows.map(r => r.org_id);
            if (allowedOrgs.length > 0) {
                conditions.push(`org_id = ANY($${paramIdx})`);
                params.push(allowedOrgs);
                paramIdx++;
            } else {
                // Return empty if no access
                return { series: [], summary: { count: 0 } };
            }
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `SELECT * FROM ${viewName} ${whereClause} LIMIT ${limit}`;
        this.logger.debug(`Executing metric query: ${sql}`);

        const { rows } = await this.db.query(sql, params);

        // Compute summary
        const valueCol = this.kpiValueCol[dto.kpiId];
        const numericValues = rows
            .map((r: any) => parseFloat(r[valueCol]))
            .filter((v: number) => !isNaN(v));

        const summary = {
            count: rows.length,
            ...(numericValues.length > 0 && {
                avg: parseFloat((numericValues.reduce((a: number, b: number) => a + b, 0) / numericValues.length).toFixed(4)),
                min: Math.min(...numericValues),
                max: Math.max(...numericValues),
            }),
        };

        const result = { series: rows, summary };
        this.cache.set(cacheKey, result, 60); // 1 min cache

        // Audit log
        if (userId) {
            this.audit.log({
                userId,
                action: 'QUERY',
                resource: dto.kpiId,
                details: { filters: dto.filters, timeRange: dto.timeRange, resultCount: rows.length }
            }).catch(e => this.logger.error('Failed to write audit log', e));
        }

        return result;
    }

    private getDateColumn(kpiId: string): string | null {
        const dateColMap: Record<string, string> = {
            OTIF_001: 'order_date',
            OTD_002: 'order_date',
            FILL_003: 'order_date',
            DOH_005: 'snapshot_date',
            TURNS_006: 'month_date',
            STOCKOUT_007: 'snapshot_date',
            EO_008: 'snapshot_date',
            FCACC_009: 'forecast_date',
            FCBIAS_010: 'forecast_date',
            SCHEDADH_011: 'production_date',
            CAPUTIL_012: 'production_date',
            SUPOT_013: 'po_date',
            LTVAR_014: 'po_date',
            SUPPPM_015: 'po_date',
            FRCOST_016: 'ship_date',
            TTVAR_017: 'ship_date',
            CAROT_018: 'ship_date',
        };
        return dateColMap[kpiId] || null;
    }
}
