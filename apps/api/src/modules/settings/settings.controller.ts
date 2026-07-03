import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('settings')
@Controller('settings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, description: 'All settings' })
  async getAll() {
    return this.settingsService.getAllSettings();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get settings by category' })
  @ApiResponse({ status: 200, description: 'Settings for category' })
  async getByCategory(@Param('category') category: string) {
    return this.settingsService.getSettingsByCategory(category);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  @ApiResponse({ status: 200, description: 'Setting value' })
  async get(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Create or update setting' })
  @ApiResponse({ status: 200, description: 'Setting updated' })
  async upsert(
    @Param('key') key: string,
    @Body() body: { value: any; category?: string; description?: string },
  ) {
    return this.settingsService.upsertSetting(key, body.value, body.category, body.description);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete setting' })
  @ApiResponse({ status: 200, description: 'Setting deleted' })
  async remove(@Param('key') key: string) {
    return this.settingsService.deleteSetting(key);
  }

  @Put('initialize/defaults')
  @ApiOperation({ summary: 'Initialize default settings' })
  @ApiResponse({ status: 200, description: 'Defaults initialized' })
  async initializeDefaults() {
    return this.settingsService.initializeDefaults();
  }
}
