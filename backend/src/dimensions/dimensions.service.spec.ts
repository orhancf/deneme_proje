import { Test, TestingModule } from '@nestjs/testing';
import { DimensionsService } from './dimensions.service';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../common/cache.service';

describe('DimensionsService', () => {
    let service: DimensionsService;
    let mockQuery: jest.Mock;
    let mockCacheGet: jest.Mock;
    let mockCacheSet: jest.Mock;

    beforeEach(async () => {
        mockQuery = jest.fn();
        mockCacheGet = jest.fn().mockReturnValue(null);
        mockCacheSet = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DimensionsService,
                { provide: DatabaseService, useValue: { query: mockQuery } },
                { provide: CacheService, useValue: { get: mockCacheGet, set: mockCacheSet } },
            ],
        }).compile();

        service = module.get<DimensionsService>(DimensionsService);
    });

    describe('getAvailableDimensions()', () => {
        it('should return all 6 dimension names', () => {
            const dims = service.getAvailableDimensions();

            expect(dims).toEqual(['org', 'product', 'customer', 'supplier', 'carrier', 'lane']);
            expect(dims).toHaveLength(6);
        });
    });

    describe('getMembers()', () => {
        it('should return members for a valid dimension', async () => {
            const mockOrgs = [
                { org_id: 'PLT-01', org_name: 'Plant Alpha' },
                { org_id: 'DC-01', org_name: 'DC West' },
            ];
            mockQuery.mockResolvedValueOnce({ rows: mockOrgs, rowCount: 2 });

            const result = await service.getMembers('org');

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('org_id', 'PLT-01');
        });

        it('should throw error for an unknown dimension', async () => {
            await expect(service.getMembers('unknown')).rejects.toThrow('Unknown dimension: unknown');
        });

        it('should add ILIKE filter when search parameter is provided', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            await service.getMembers('org', 'Plant');

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('ILIKE $1'),
                ['%Plant%'],
            );
        });

        it('should cache results for 300 seconds', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            await service.getMembers('product');

            expect(mockCacheSet).toHaveBeenCalledWith(
                'dim:product:all',
                expect.any(Array),
                300,
            );
        });

        it('should return cached results when available', async () => {
            const cached = [{ org_id: 'cached' }];
            mockCacheGet.mockReturnValueOnce(cached);

            const result = await service.getMembers('org');

            expect(result).toEqual(cached);
            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should query the correct table for each dimension', async () => {
            mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });

            await service.getMembers('supplier');

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('analytics.dim_supplier'),
                [],
            );
        });
    });
});
