import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('opportunities')
  @ApiOperation({ summary: 'Get opportunity analytics' })
  @ApiResponse({ status: 200, description: 'Opportunity analytics' })
  async getOpportunityAnalytics() {
    return this.analyticsService.getOpportunityAnalytics();
  }

  @Get('sources')
  @ApiOperation({ summary: 'Get source analytics' })
  @ApiResponse({ status: 200, description: 'Source analytics' })
  async getSourceAnalytics() {
    return this.analyticsService.getSourceAnalytics();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'User analytics' })
  async getUserAnalytics() {
    return this.analyticsService.getUserAnalytics();
  }
}
