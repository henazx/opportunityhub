import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SourcesService } from './sources.service';
import { CreateSourceDto, UpdateSourceDto, SourceFilterDto } from './dto/source.dto';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('sources')
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new source' })
  @ApiResponse({ status: 201, description: 'Source created' })
  async create(@Body() createDto: CreateSourceDto) {
    return this.sourcesService.create(createDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sources' })
  @ApiResponse({ status: 200, description: 'Sources list' })
  async findAll(@Query() filters: SourceFilterDto) {
    return this.sourcesService.findAll(filters);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get source statistics' })
  async getStats() {
    return this.sourcesService.getStats();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get source by ID' })
  @ApiResponse({ status: 200, description: 'Source details' })
  async findById(@Param('id') id: string) {
    return this.sourcesService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update source' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateSourceDto) {
    return this.sourcesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete source' })
  async remove(@Param('id') id: string) {
    return this.sourcesService.softDelete(id);
  }
}
