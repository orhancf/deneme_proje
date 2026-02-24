import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DimensionsService } from './dimensions.service';

@ApiTags('dimensions')
@Controller('dimensions')
export class DimensionsController {
    constructor(private readonly dimensionsService: DimensionsService) { }

    @Get()
    @ApiOperation({ summary: 'List available dimension names' })
    getAvailable() {
        return this.dimensionsService.getAvailableDimensions();
    }

    @Get(':dimName')
    @ApiOperation({ summary: 'Get members of a dimension (for filter dropdowns)' })
    @ApiParam({ name: 'dimName', example: 'org' })
    @ApiQuery({ name: 'search', required: false })
    async getMembers(
        @Param('dimName') dimName: string,
        @Query('search') search?: string,
    ) {
        return this.dimensionsService.getMembers(dimName, search);
    }
}
