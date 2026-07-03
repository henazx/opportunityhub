import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform overview (admin)' })
  @ApiResponse({ status: 200, description: 'Platform overview' })
  async getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user dashboard' })
  @ApiResponse({ status: 200, description: 'User dashboard data' })
  async getUserDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getUserDashboard(user.id);
  }
}
