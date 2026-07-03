import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationFilterDto } from './dto/application.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('applications')
@Controller('applications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an application tracker entry' })
  @ApiResponse({ status: 201, description: 'Application created' })
  async create(@CurrentUser() user: any, @Body() createDto: CreateApplicationDto) {
    return this.applicationsService.create(user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @ApiResponse({ status: 200, description: 'Applications list' })
  async findAll(@CurrentUser() user: any, @Query() filters: ApplicationFilterDto) {
    return this.applicationsService.findAll(user.id, filters);
  }

  @Get('statuses')
  @ApiOperation({ summary: 'Get applications grouped by status' })
  async getByStatus(@CurrentUser() user: any) {
    return this.applicationsService.getByStatus(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, description: 'Application details' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.applicationsService.findById(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiResponse({ status: 200, description: 'Application updated' })
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateDto: UpdateApplicationDto) {
    return this.applicationsService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove application' })
  @ApiResponse({ status: 200, description: 'Application removed' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.applicationsService.remove(user.id, id);
  }
}
