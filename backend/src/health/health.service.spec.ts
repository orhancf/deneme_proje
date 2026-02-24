import { Test, TestingModule } from '@nestjs/testing';
import { HealthService, FreshnessResult } from './health.service';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../common/cache.service';

describe('HealthService', () => {
    let service: HealthService;
    let mockQuery: jest.Mock;
    let mockCacheGet: jest.Mock;
    let mockCacheSet: jest.Mock;

    beforeEach(async () => {
        mockQuery = jest.fn();
        mockCacheGet = jest.fn().mockReturnValue(null);
        mockCacheSet = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HealthService,
                { provide: DatabaseService, useValue: { query: mockQuery } },
                { provide: CacheService, useValue: { get: mockCacheGet, set: mockCacheSet } },
            ],
        }).compile();

        service = module.get<HealthService>(HealthService);
    });

    describe('ping()', () => {
        it('should return status ok with a valid timestamp', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }], rowCount: 1 });

            const result = await service.ping();

            expect(result).toHaveProperty('status', 'ok');
            expect(result).toHaveProperty('timestamp');
            expect(new Date(result.timestamp).getTime()).not.toBeNaN();
        });

        it('should execute SELECT 1 against the database', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }], rowCount: 1 });

            await service.ping();

            expect(mockQuery).toHaveBeenCalledWith('SELECT 1');
        });
    });

    describe('getFreshness()', () => {
        const MOCK_ROWS = [
            { table_name: 'fact_orders', last_load: '2025-01-15T06:00:00Z', row_count: '50000', hours_since_load: '2.5' },
            { table_name: 'fact_inventory', last_load: '2025-01-14T06:00:00Z', row_count: '80000', hours_since_load: '26.5' },
            { table_name: 'fact_production', last_load: '2025-01-12T06:00:00Z', row_count: '10000', hours_since_load: '74.5' },
        ];

        it('should return freshness results with correct SLA status', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_ROWS, rowCount: 3 });

            const results = await service.getFreshness();

            expect(results).toHaveLength(3);
            expect(results[0].sla_status).toBe('GREEN');  // 2.5h < 24h
            expect(results[1].sla_status).toBe('YELLOW'); // 26.5h < 48h
            expect(results[2].sla_status).toBe('RED');    // 74.5h > 48h
        });

        it('should parse row_count as integer', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [MOCK_ROWS[0]], rowCount: 1 });

            const results = await service.getFreshness();

            expect(typeof results[0].row_count).toBe('number');
            expect(results[0].row_count).toBe(50000);
        });

        it('should cache results for 120 seconds', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [MOCK_ROWS[0]], rowCount: 1 });

            await service.getFreshness();

            expect(mockCacheSet).toHaveBeenCalledWith('freshness', expect.any(Array), 120);
        });

        it('should return cached results when available', async () => {
            const cachedData: FreshnessResult[] = [{
                table_name: 'cached_table',
                last_load: '2025-01-15T06:00:00Z',
                row_count: 100,
                sla_status: 'GREEN',
                hours_since_load: 1.0,
            }];
            mockCacheGet.mockReturnValueOnce(cachedData);

            const results = await service.getFreshness();

            expect(results).toEqual(cachedData);
            expect(mockQuery).not.toHaveBeenCalled();
        });
    });

    describe('getCompletenessChecks()', () => {
        it('should return quality check rows from the database', async () => {
            const mockChecks = [
                { check_name: 'Null check', status: 'PASS', metric_value: 0.0 },
                { check_name: 'Range check', status: 'FAIL', metric_value: 0.15 },
            ];
            mockQuery.mockResolvedValueOnce({ rows: mockChecks, rowCount: 2 });

            const results = await service.getCompletenessChecks();

            expect(results).toHaveLength(2);
            expect(results[0].check_name).toBe('Null check');
            expect(results[1].status).toBe('FAIL');
        });

        it('should query data_quality_log table with LIMIT 50', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            await service.getCompletenessChecks();

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('data_quality_log'),
            );
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('LIMIT 50'),
            );
        });
    });
});
