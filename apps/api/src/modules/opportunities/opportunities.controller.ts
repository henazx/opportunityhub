import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto, UpdateOpportunityDto, OpportunityFilterDto } from './dto/opportunity.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.ORGANIZATION, UserRole.RECRUITER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new opportunity' })
  @ApiResponse({ status: 201, description: 'Opportunity created' })
  async create(@Body() createDto: CreateOpportunityDto) {
    return this.opportunitiesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all opportunities with filters' })
  @ApiResponse({ status: 200, description: 'Opportunities list' })
  async findAll(@Query() filters: OpportunityFilterDto) {
    return this.opportunitiesService.findAll(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get opportunity statistics' })
  @ApiResponse({ status: 200, description: 'Opportunity stats' })
  async getStats() {
    return this.opportunitiesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity by ID' })
  @ApiResponse({ status: 200, description: 'Opportunity details' })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  async findById(@Param('id') id: string) {
    return this.opportunitiesService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.ORGANIZATION, UserRole.RECRUITER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update opportunity' })
  @ApiResponse({ status: 200, description: 'Opportunity updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateOpportunityDto) {
    return this.opportunitiesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete opportunity' })
  @ApiResponse({ status: 200, description: 'Opportunity deleted' })
  async remove(@Param('id') id: string) {
    return this.opportunitiesService.softDelete(id);
  }
}
