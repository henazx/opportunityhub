import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ValidationService } from './validation.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('validation')
@Controller('validation')
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get validation dashboard' })
  @ApiResponse({ status: 200, description: 'Validation stats and recent checks' })
  async getDashboard() {
    return this.validationService.getValidationDashboard();
  }

  @Get('deadlines')
  @ApiOperation({ summary: 'Get deadline report' })
  @ApiResponse({ status: 200, description: 'Deadline statistics and urgent opportunities' })
  async getDeadlines() {
    return this.validationService.getDeadlineReport();
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get opportunity recommendations' })
  @ApiResponse({ status: 200, description: 'Personalized recommendations' })
  async getRecommendations(@CurrentUser() user?: any) {
    return this.validationService.getRecommendations(user?.id);
  }

  @Post('validate/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate a single opportunity' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateOpportunity(@Param('id') id: string) {
    return this.validationService.validateOpportunity(id);
  }

  @Post('validate-all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate all opportunities' })
  @ApiResponse({ status: 200, description: 'Batch validation result' })
  async validateAll() {
    return this.validationService.validateAllOpportunities();
  }
}
