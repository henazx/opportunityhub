import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      totalOpportunities,
      activeOpportunities,
      totalOrganizations,
      totalSources,
      activeSources,
      totalUsers,
      recentOpportunities,
      opportunitiesByType,
      topOrganizations,
    ] = await Promise.all([
      this.prisma.opportunity.count({ where: { deletedAt: null } }),
      this.prisma.opportunity.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.organization.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.source.count({ where: { deletedAt: null } }),
      this.prisma.source.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.opportunity.findMany({
        where: { isActive: true, deletedAt: null },
        orderBy: { importedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          type: true,
          importedAt: true,
          organization: { select: { name: true, logoUrl: true } },
        },
      }),
      this.prisma.opportunity.groupBy({
        by: ['type'],
        _count: { id: true },
        where: { isActive: true, deletedAt: null },
      }),
      this.prisma.organization.findMany({
        where: { isActive: true, deletedAt: null },
        include: { _count: { select: { opportunities: true } } },
        orderBy: { opportunities: { _count: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      stats: {
        totalOpportunities,
        activeOpportunities,
        totalOrganizations,
        totalSources,
        activeSources,
        totalUsers,
      },
      recentOpportunities,
      opportunitiesByType: opportunitiesByType.map((item) => ({
        type: item.type,
        count: item._count.id,
      })),
      topOrganizations,
    };
  }

  async getUserDashboard(userId: string) {
    const [bookmarks, recentSearches, savedOpportunities] = await Promise.all([
      this.prisma.bookmark.count({ where: { userId } }),
      this.prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { searchedAt: 'desc' },
        take: 10,
      }),
      this.prisma.bookmark.findMany({
        where: { userId },
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              type: true,
              applicationDeadline: true,
              organization: { select: { name: true, logoUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      bookmarkCount: bookmarks,
      recentSearches,
      savedOpportunities,
    };
  }
}
