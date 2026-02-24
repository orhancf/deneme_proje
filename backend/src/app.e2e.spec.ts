import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// ── Mock Data ──────────────────────────────────────────────
const MOCK_KPI_CATALOG = [
    {
        kpi_id: 'OTIF_001',
        name: 'OTIF %',
        description: 'On-Time In-Full delivery percentage',
        owner: 'SC Director',
        business_question: 'Are we delivering on time and in full?',
        formula_business: 'On-Time AND In-Full / Total Delivered',
        formula_sql: null,
        unit: '%',
        grain: 'order_line / week / org',
        dimensions: ['org', 'product', 'customer'],
        refresh_sla: 'Daily 06:00',
        source_tables: ['fact_orders'],
        thresholds: { green: 95, yellow: 90, red: 0 },
        is_active: true,
    },
    {
        kpi_id: 'DOH_005',
        name: 'Days on Hand',
        description: 'Average days of inventory on hand',
        owner: 'Inventory Mgr',
        business_question: 'How much inventory do we hold?',
        formula_business: 'On-Hand / Avg Daily Consumption',
        formula_sql: null,
        unit: 'days',
        grain: 'product-loc / day',
        dimensions: ['org', 'product'],
        refresh_sla: 'Daily 06:00',
        source_tables: ['fact_inventory_snapshot'],
        thresholds: { green: 30, yellow: 45, red: 60 },
        is_active: true,
    },
];

const MOCK_FRESHNESS = [
    {
        table_name: 'fact_orders',
        last_load: '2025-01-15T06:00:00Z',
        row_count: '50000',
        hours_since_load: '2.5',
    },
    {
        table_name: 'fact_inventory_snapshot',
        last_load: '2025-01-15T06:00:00Z',
        row_count: '80000',
        hours_since_load: '2.5',
    },
];

const MOCK_QUALITY_CHECKS = [
    {
        check_name: 'Null check',
        check_type: 'COMPLETENESS',
        target_table: 'fact_orders',
        status: 'PASS',
        metric_value: 0.0,
        threshold: 0.01,
        checked_at: '2025-01-15T06:05:00Z',
    },
];

const MOCK_DIMENSIONS_ORG = [
    { org_id: 'PLT-01', org_name: 'Plant Alpha', org_type: 'PLANT', parent_org_id: 'HQ-01', country: 'US', region: 'NA' },
    { org_id: 'DC-01', org_name: 'DC West', org_type: 'DC', parent_org_id: 'HQ-01', country: 'US', region: 'NA' },
];

const MOCK_AUDIT_LOGS = [
    {
        log_id: 1,
        user_id: 'a0000000-0000-0000-0000-000000000001',
        action: 'LOGIN',
        resource: 'Application',
        details: { email: 'admin@scct.dev' },
        ip_address: '127.0.0.1',
        user_agent: 'test',
        created_at: '2025-01-15T10:00:00Z',
        email: 'admin@scct.dev',
        display_name: 'Admin User',
    },
];

const MOCK_METRIC_QUERY_ROWS = [
    { order_date: '2025-01-01', org_id: 'PLT-01', otif_pct: 95.5, otd_pct: 97.0, fill_rate_pct: 96.2 },
    { order_date: '2025-01-02', org_id: 'PLT-01', otif_pct: 93.1, otd_pct: 95.5, fill_rate_pct: 94.8 },
];

const MOCK_USER_ACCESS = [
    { org_id: 'PLT-01' },
    { org_id: 'DC-01' },
];

// ── Test Setup ─────────────────────────────────────────────
describe('Supply Chain Control Tower — E2E Tests', () => {
    let app: INestApplication;
    let mockQuery: jest.Mock;

    const AUTH_HEADERS = {
        'X-User-Id': 'a0000000-0000-0000-0000-000000000001',
        'X-User-Role': 'ADMIN',
    };

    const ANALYST_HEADERS = {
        'X-User-Id': 'a0000000-0000-0000-0000-000000000003',
        'X-User-Role': 'ANALYST',
    };

    beforeAll(async () => {
        mockQuery = jest.fn();

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(DatabaseService)
            .useValue({
                query: mockQuery,
                onModuleDestroy: jest.fn(),
            })
            .compile();

        app = moduleRef.createNestApplication();
        app.setGlobalPrefix('api');

        // Setup Swagger (same as main.ts)
        const config = new DocumentBuilder()
            .setTitle('SCCT API')
            .setVersion('1.0')
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);

        await app.init();
    });

    afterAll(async () => {
        if (app) await app.close();
    });

    beforeEach(() => {
        mockQuery.mockReset();
    });

    // ── 1. Health Module ───────────────────────────────────
    describe('Health Module', () => {
        it('GET /api/health → 200 with status and timestamp (public)', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }], rowCount: 1 });

            const res = await request(app.getHttpServer())
                .get('/api/health')
                .expect(200);

            expect(res.body).toHaveProperty('status', 'ok');
            expect(res.body).toHaveProperty('timestamp');
            expect(new Date(res.body.timestamp).getTime()).not.toBeNaN();
        });

        it('GET /api/health/freshness → 200 with freshness data', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_FRESHNESS, rowCount: 2 });

            const res = await request(app.getHttpServer())
                .get('/api/health/freshness')
                .set(AUTH_HEADERS)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('table_name', 'fact_orders');
            expect(res.body[0]).toHaveProperty('sla_status');
            expect(res.body[0]).toHaveProperty('hours_since_load');
            expect(typeof res.body[0].row_count).toBe('number');
        });

        it('GET /api/health/quality → 200 with quality checks', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_QUALITY_CHECKS, rowCount: 1 });

            const res = await request(app.getHttpServer())
                .get('/api/health/quality')
                .set(AUTH_HEADERS)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0]).toHaveProperty('check_name');
            expect(res.body[0]).toHaveProperty('status', 'PASS');
        });
    });

    // ── 2. Metrics Module ──────────────────────────────────
    describe('Metrics Module', () => {
        it('GET /api/metrics → 200 with KPI catalog array', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_KPI_CATALOG, rowCount: 2 });

            const res = await request(app.getHttpServer())
                .get('/api/metrics')
                .set(AUTH_HEADERS)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('kpi_id', 'OTIF_001');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('unit');
            expect(res.body[0]).toHaveProperty('thresholds');
        });

        it('GET /api/metrics/OTIF_001 → 200 with single KPI definition', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_KPI_CATALOG, rowCount: 2 });

            const res = await request(app.getHttpServer())
                .get('/api/metrics/OTIF_001')
                .set(AUTH_HEADERS)
                .expect(200);

            expect(res.body).toHaveProperty('kpi_id', 'OTIF_001');
            expect(res.body).toHaveProperty('name', 'OTIF %');
            expect(res.body).toHaveProperty('owner', 'SC Director');
        });

        it('GET /api/metrics/NONEXIST → 404 not found', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_KPI_CATALOG, rowCount: 2 });

            await request(app.getHttpServer())
                .get('/api/metrics/NONEXIST')
                .set(AUTH_HEADERS)
                .expect(404);
        });

        it('POST /api/metrics/query → 201 with series and summary', async () => {
            // The catalog may be cached from previous tests, so provide query results
            // If catalog is not cached, first call returns catalog, second returns query
            mockQuery.mockResolvedValueOnce({ rows: MOCK_KPI_CATALOG, rowCount: 2 });
            mockQuery.mockResolvedValueOnce({ rows: MOCK_METRIC_QUERY_ROWS, rowCount: 2 });

            const res = await request(app.getHttpServer())
                .post('/api/metrics/query')
                .set(AUTH_HEADERS)
                .send({
                    kpiId: 'OTIF_001',
                    timeRange: { start: '2025-01-01', end: '2025-12-31' },
                    limit: 100,
                })
                .expect(201);

            expect(res.body).toHaveProperty('series');
            expect(res.body).toHaveProperty('summary');
            expect(Array.isArray(res.body.series)).toBe(true);
            expect(res.body.summary).toHaveProperty('count');
            expect(res.body.summary.count).toBeGreaterThanOrEqual(0);
        });
    });

    // ── 3. Dimensions Module ───────────────────────────────
    describe('Dimensions Module', () => {
        it('GET /api/dimensions → 200 with dimension names', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/dimensions')
                .set(AUTH_HEADERS)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toContain('org');
            expect(res.body).toContain('product');
            expect(res.body).toContain('customer');
            expect(res.body).toContain('supplier');
            expect(res.body).toContain('carrier');
            expect(res.body).toContain('lane');
        });

        it('GET /api/dimensions/org → 200 with org members', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_DIMENSIONS_ORG, rowCount: 2 });

            const res = await request(app.getHttpServer())
                .get('/api/dimensions/org')
                .set(AUTH_HEADERS)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('org_id');
            expect(res.body[0]).toHaveProperty('org_name');
        });

        it('GET /api/dimensions/org?search=Plant → 200 with filtered results', async () => {
            mockQuery.mockResolvedValueOnce({
                rows: [MOCK_DIMENSIONS_ORG[0]],
                rowCount: 1,
            });

            const res = await request(app.getHttpServer())
                .get('/api/dimensions/org?search=Plant')
                .set(AUTH_HEADERS)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].org_name).toContain('Plant');
        });
    });

    // ── 4. Audit Module ────────────────────────────────────
    describe('Audit Module', () => {
        it('GET /api/audit → 200 with audit logs (ADMIN)', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_AUDIT_LOGS, rowCount: 1 });

            const res = await request(app.getHttpServer())
                .get('/api/audit')
                .set(AUTH_HEADERS)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0]).toHaveProperty('action', 'LOGIN');
            expect(res.body[0]).toHaveProperty('email', 'admin@scct.dev');
        });

        it('POST /api/audit → 201 logs an action (ADMIN)', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

            await request(app.getHttpServer())
                .post('/api/audit')
                .set(AUTH_HEADERS)
                .send({
                    action: 'EXPORT',
                    resource: 'Dashboard: Command Center',
                    details: { format: 'CSV' },
                })
                .expect(201);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO app.audit_log'),
                expect.any(Array),
            );
        });
    });

    // ── 5. Auth Guard ──────────────────────────────────────
    describe('Auth Guard', () => {
        it('Unauthenticated request to protected endpoint → 401', async () => {
            await request(app.getHttpServer())
                .get('/api/metrics')
                .expect(401);
        });

        it('Non-ADMIN accessing /api/audit → 403 Forbidden', async () => {
            await request(app.getHttpServer())
                .get('/api/audit')
                .set(ANALYST_HEADERS)
                .expect(403);
        });

        it('Public endpoint /api/health works without auth headers', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }], rowCount: 1 });

            const res = await request(app.getHttpServer())
                .get('/api/health')
                .expect(200);

            expect(res.body.status).toBe('ok');
        });
    });

    // ── 6. OpenAPI / Swagger ───────────────────────────────
    describe('Swagger / OpenAPI', () => {
        it('GET /api/docs-json → 200 with valid OpenAPI spec', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/docs-json')
                .expect(200);

            expect(res.body).toHaveProperty('openapi');
            expect(res.body).toHaveProperty('info');
            expect(res.body.info).toHaveProperty('title', 'SCCT API');
            expect(res.body).toHaveProperty('paths');
            expect(Object.keys(res.body.paths).length).toBeGreaterThan(0);

            // Verify key paths exist
            const paths = Object.keys(res.body.paths);
            expect(paths).toContain('/api/health');
            expect(paths).toContain('/api/metrics');
            expect(paths).toContain('/api/dimensions');
            expect(paths).toContain('/api/audit');
        });
    });
});
