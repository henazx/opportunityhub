import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CollectorsService } from './collectors.service';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('collectors')
@Controller('collectors')
export class CollectorsController {
  constructor(private readonly collectorsService: CollectorsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available collectors' })
  @ApiResponse({ status: 200, description: 'Available collectors list' })
  getAvailable() {
    return {
      collectors: this.collectorsService.getAvailableCollectors(),
    };
  }

  @Post('run/:sourceId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run collector for a specific source' })
  @ApiResponse({ status: 200, description: 'Collector run result' })
  async runCollector(@Param('sourceId') sourceId: string) {
    return this.collectorsService.runCollector(sourceId);
  }

  @Post('run-all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run all active collectors' })
  @ApiResponse({ status: 200, description: 'All collectors run results' })
  async runAll() {
    const results = await this.collectorsService.runAllActiveCollectors();
    return {
      results: Object.fromEntries(results),
    };
  }
}
