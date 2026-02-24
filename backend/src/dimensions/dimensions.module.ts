import { Module } from '@nestjs/common';
import { DimensionsController } from './dimensions.controller';
import { DimensionsService } from './dimensions.service';
import { CacheService } from '../common/cache.service';

@Module({
    controllers: [DimensionsController],
    providers: [DimensionsService, CacheService],
})
export class DimensionsModule { }
