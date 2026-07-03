import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSetting(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting '${key}' not found`);
    }
    return setting;
  }

  async getSettingsByCategory(category: string) {
    return this.prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
  }

  async getAllSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { category: 'asc' },
    });
  }

  async upsertSetting(key: string, value: any, category = 'general', description?: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, category, description },
      create: { key, value, category, description },
    });
  }

  async deleteSetting(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting '${key}' not found`);
    }

    await this.prisma.systemSetting.delete({ where: { key } });
    return { message: `Setting '${key}' deleted` };
  }

  async initializeDefaults() {
    const defaults = [
      { key: 'site.name', value: 'OpportunityHub', category: 'general', description: 'Platform name' },
      { key: 'site.description', value: 'Opportunity Discovery Platform', category: 'general', description: 'Platform description' },
      { key: 'site.url', value: 'https://opportunityhub.com', category: 'general', description: 'Platform URL' },
      { key: 'collector.autoRun', value: false, category: 'collector', description: 'Auto-run collectors' },
      { key: 'collector.interval', value: 'daily', category: 'collector', description: 'Default collector interval' },
      { key: 'notifications.email.enabled', value: false, category: 'notifications', description: 'Enable email notifications' },
      { key: 'registration.enabled', value: true, category: 'auth', description: 'Enable user registration' },
    ];

    for (const setting of defaults) {
      await this.upsertSetting(setting.key, setting.value, setting.category, setting.description);
    }

    return { message: 'Default settings initialized' };
  }
}
