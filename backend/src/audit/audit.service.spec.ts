import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { DatabaseService } from '../database/database.service';

describe('AuditService', () => {
    let service: AuditService;
    let mockQuery: jest.Mock;

    beforeEach(async () => {
        mockQuery = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditService,
                { provide: DatabaseService, useValue: { query: mockQuery } },
            ],
        }).compile();

        service = module.get<AuditService>(AuditService);
    });

    describe('log()', () => {
        it('should insert an audit record with all parameters', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

            await service.log({
                userId: 'user-123',
                action: 'LOGIN',
                resource: 'Application',
                details: { email: 'test@scct.dev' },
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
            });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO app.audit_log'),
                [
                    'user-123',
                    'LOGIN',
                    'Application',
                    JSON.stringify({ email: 'test@scct.dev' }),
                    '192.168.1.1',
                    'Mozilla/5.0',
                ],
            );
        });

        it('should handle null optional parameters', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

            await service.log({
                action: 'SYSTEM_EVENT',
            });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO app.audit_log'),
                [null, 'SYSTEM_EVENT', null, null, null, null],
            );
        });

        it('should stringify details as JSON', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

            await service.log({
                action: 'EXPORT',
                details: { format: 'CSV', dashboard: 'Command Center' },
            });

            const callArgs = mockQuery.mock.calls[0][1];
            expect(callArgs[3]).toBe(JSON.stringify({ format: 'CSV', dashboard: 'Command Center' }));
        });
    });

    describe('getRecentLogs()', () => {
        const MOCK_LOGS = [
            { log_id: 1, action: 'LOGIN', email: 'admin@scct.dev', created_at: '2025-01-15' },
            { log_id: 2, action: 'QUERY', email: 'analyst@scct.dev', created_at: '2025-01-14' },
        ];

        it('should return audit logs with default limit 100', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_LOGS, rowCount: 2 });

            const result = await service.getRecentLogs();

            expect(result).toHaveLength(2);
            expect(result[0].action).toBe('LOGIN');
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('LIMIT $1'),
                [100],
            );
        });

        it('should respect custom limit parameter', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [MOCK_LOGS[0]], rowCount: 1 });

            const result = await service.getRecentLogs(10);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                [10],
            );
        });

        it('should join with app_user table for user details', async () => {
            mockQuery.mockResolvedValueOnce({ rows: MOCK_LOGS, rowCount: 2 });

            await service.getRecentLogs();

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('LEFT JOIN app.app_user'),
                expect.any(Array),
            );
        });
    });
});
