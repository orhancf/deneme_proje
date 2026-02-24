import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../common/cache.service';

@Injectable()
export class DimensionsService {
    private readonly dimTableMap: Record<string, { table: string; idCol: string; labelCol: string; extraCols?: string[] }> = {
        org: { table: 'analytics.dim_org', idCol: 'org_id', labelCol: 'org_name', extraCols: ['org_type', 'parent_org_id', 'country', 'region'] },
        product: { table: 'analytics.dim_product', idCol: 'product_id', labelCol: 'product_name', extraCols: ['product_family', 'category'] },
        customer: { table: 'analytics.dim_customer', idCol: 'customer_id', labelCol: 'customer_name', extraCols: ['segment', 'channel', 'country'] },
        supplier: { table: 'analytics.dim_supplier', idCol: 'supplier_id', labelCol: 'supplier_name', extraCols: ['country', 'tier'] },
        carrier: { table: 'analytics.dim_carrier', idCol: 'carrier_id', labelCol: 'carrier_name', extraCols: ['mode'] },
        lane: { table: 'analytics.dim_lane', idCol: 'lane_id', labelCol: 'lane_id', extraCols: ['origin_org_id', 'destination_org_id', 'incoterm'] },
    };

    constructor(
        private readonly db: DatabaseService,
        private readonly cache: CacheService,
    ) { }

    getAvailableDimensions(): string[] {
        return Object.keys(this.dimTableMap);
    }

    async getMembers(dimName: string, search?: string): Promise<any[]> {
        const config = this.dimTableMap[dimName];
        if (!config) throw new Error(`Unknown dimension: ${dimName}`);

        const cacheKey = `dim:${dimName}:${search || 'all'}`;
        const cached = this.cache.get<any[]>(cacheKey);
        if (cached) return cached;

        const cols = [config.idCol, config.labelCol, ...(config.extraCols || [])].join(', ');
        let sql = `SELECT ${cols} FROM ${config.table} WHERE is_active = true`;
        const params: any[] = [];

        if (search) {
            sql += ` AND ${config.labelCol} ILIKE $1`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY ${config.labelCol} LIMIT 500`;

        const { rows } = await this.db.query(sql, params);
        this.cache.set(cacheKey, rows, 300); // 5 min
        return rows;
    }
}
