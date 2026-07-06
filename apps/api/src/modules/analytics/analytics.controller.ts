import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

class TrackPageViewDto {
  @ApiProperty({ example: '/opportunities/123' })
  path: string;

  @ApiProperty({ required: false })
  referrer?: string;
}

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track a page view (public)' })
  @ApiResponse({ status: 201, description: 'Page view tracked' })
  async trackPageView(@Body() dto: TrackPageViewDto, @Req() req: any) {
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    const userAgent = req.headers?.['user-agent'] || null;

    return this.analyticsService.trackPageView({
      path: dto.path,
      userId,
      ipAddress,
      userAgent,
      referrer: dto.referrer,
    });
  }

  @Get('visitors')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get visitor analytics (admin only)' })
  @ApiResponse({ status: 200, description: 'Visitor analytics' })
  async getVisitorStats() {
    return this.analyticsService.getVisitorStats();
  }

  @Get('opportunities')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get opportunity analytics' })
  @ApiResponse({ status: 200, description: 'Opportunity analytics' })
  async getOpportunityAnalytics() {
    return this.analyticsService.getOpportunityAnalytics();
  }

  @Get('sources')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get source analytics' })
  @ApiResponse({ status: 200, description: 'Source analytics' })
  async getSourceAnalytics() {
    return this.analyticsService.getSourceAnalytics();
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'User analytics' })
  async getUserAnalytics() {
    return this.analyticsService.getUserAnalytics();
  }
}
