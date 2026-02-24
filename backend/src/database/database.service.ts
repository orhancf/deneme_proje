import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private readonly pool: Pool;
    private readonly logger = new Logger(DatabaseService.name);

    constructor() {
        this.pool = new Pool({
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5432'),
            user: process.env.DATABASE_USER || 'scct',
            password: process.env.DATABASE_PASSWORD || 'scct_dev_2024',
            database: process.env.DATABASE_NAME || 'scct_db',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        this.pool.on('error', (err) => {
            this.logger.error('Unexpected pool error', err.stack);
        });
    }

    async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
        const start = Date.now();
        const result = await this.pool.query<T>(text, params);
        const duration = Date.now() - start;
        this.logger.debug(`Query executed in ${duration}ms — rows: ${result.rowCount}`);
        return result;
    }

    async onModuleDestroy() {
        await this.pool.end();
    }
}
