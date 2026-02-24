import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService, MetricQueryDto } from './metrics.service';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../common/cache.service';
import { AuditService } from '../audit/audit.service';

describe('MetricsService', () => {
    let service: MetricsService;
    let dbService: jest.Mocked<DatabaseService>;
    let cacheService: jest.Mocked<CacheService>;
    let auditService: jest.Mocked<AuditService>;

    beforeEach(async () => {
        dbService = {
            query: jest.fn(),
        } as any;

        cacheService = {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
        } as any;

        auditService = {
            log: jest.fn().mockResolvedValue(true),
            getRecentLogs: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MetricsService,
                { provide: DatabaseService, useValue: dbService },
                { provide: CacheService, useValue: cacheService },
                { provide: AuditService, useValue: auditService },
            ],
        }).compile();

        service = module.get<MetricsService>(MetricsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getCatalog', () => {
        it('should return cached catalog if available', async () => {
            const mockCatalog = [{ kpi_id: 'OTIF_001', name: 'OTIF' }];
            cacheService.get.mockReturnValue(mockCatalog);

            const result = await service.getCatalog();
            expect(result).toEqual(mockCatalog);
            expect(dbService.query).not.toHaveBeenCalled();
        });

        it('should fetch from db and cache if not in cache', async () => {
            cacheService.get.mockReturnValue(null);
            const mockCatalog = [{ kpi_id: 'OTIF_001', name: 'OTIF' }];
            dbService.query.mockResolvedValue({ rows: mockCatalog } as any);

            const result = await service.getCatalog();
            expect(result).toEqual(mockCatalog);
            expect(dbService.query).toHaveBeenCalledWith(
                'SELECT * FROM app.kpi_catalog WHERE is_active = true ORDER BY kpi_id'
            );
            expect(cacheService.set).toHaveBeenCalledWith('kpi_catalog', mockCatalog, 300);
        });
    });

    describe('queryMetric', () => {
        it('should build and execute aggregation query with filters', async () => {
            cacheService.get.mockReturnValue(null);
            const mockRows = [{ otif_pct: 0.95 }, { otif_pct: 0.98 }];
            dbService.query.mockResolvedValue({ rows: mockRows } as any);

            const dto: MetricQueryDto = {
                kpiId: 'OTIF_001',
                timeRange: { start: '2025-01-01', end: '2025-01-31' },
                filters: { org_id: 'ORG-1' },
            };

            const result = await service.queryMetric(dto);
            expect(result.series).toEqual(mockRows);
            expect(result.summary.count).toBe(2);
            expect(result.summary.avg).toBe(0.965); // (0.95 + 0.98) / 2

            // Should query DB
            expect(dbService.query).toHaveBeenCalled();
            const [sql, params] = dbService.query.mock.calls[0];
            expect(sql).toContain('analytics.v_kpi_otif');
            expect(params).toEqual(['2025-01-01', '2025-01-31', 'ORG-1']);
        });

        it('should return empty list if user has no org access in RLS', async () => {
            cacheService.get.mockReturnValue(null);
            // Setup RLS mock (user_id = 'user1' has NO allowed orgs)
            dbService.query.mockResolvedValueOnce({ rows: [] } as any);

            const dto: MetricQueryDto = { kpiId: 'OTIF_001' };

            const result = await service.queryMetric(dto, 'user1', 'VIEWER');
            expect(result.series).toEqual([]);
            expect(result.summary.count).toBe(0);

            // Audit log should not be called if returned early (or maybe it should, but based on code it returns early)
            // It actually returns early and doesn't write audit log in our code.
            expect(auditService.log).not.toHaveBeenCalled();
        });

        it('should append RLS conditions if user is not ADMIN', async () => {
            cacheService.get.mockReturnValue(null);
            // Setup RLS mock (user_id = 'user1' has org_id = 'ORG-2')
            dbService.query.mockResolvedValueOnce({ rows: [{ org_id: 'ORG-2' }] } as any);
            // Setup metric data mock
            dbService.query.mockResolvedValueOnce({ rows: [{ otif_pct: 0.92 }] } as any);

            const dto: MetricQueryDto = { kpiId: 'OTIF_001' };

            const result = await service.queryMetric(dto, 'user1', 'VIEWER');
            expect(result.series.length).toBe(1);

            const [sql, params] = dbService.query.mock.calls[1]; // second call is metric query
            expect(sql).toContain('org_id = ANY($1)');
            expect(params).toEqual([['ORG-2']]);

            expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
                action: 'QUERY',
                userId: 'user1',
                resource: 'OTIF_001'
            }));
        });
    });
});
