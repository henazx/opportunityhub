import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { LocationsModule } from './modules/locations/locations.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { SourcesModule } from './modules/sources/sources.module';
import { CollectorsModule } from './modules/collectors/collectors.module';
import { SearchModule } from './modules/search/search.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HealthModule } from './modules/health/health.module';
import { ValidationModule } from './modules/validation/validation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    CategoriesModule,
    TagsModule,
    LocationsModule,
    OpportunitiesModule,
    SourcesModule,
    CollectorsModule,
    SearchModule,
    BookmarksModule,
    ApplicationsModule,
    NotificationsModule,
    DashboardModule,
    AdminModule,
    AnalyticsModule,
    SettingsModule,
    HealthModule,
    ValidationModule,
  ],
})
export class AppModule {}
