import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOpportunityAnalytics() {
    const [
      totalViews,
      totalApplies,
      topViewed,
      topApplied,
      deadlineStats,
    ] = await Promise.all([
      this.prisma.opportunityView.count(),
      this.prisma.opportunity.aggregate({ _sum: { applyCount: true } }),
      this.prisma.opportunity.findMany({
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          type: true,
          viewCount: true,
          applyCount: true,
          organization: { select: { name: true } },
        },
      }),
      this.prisma.opportunity.findMany({
        orderBy: { applyCount: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          type: true,
          viewCount: true,
          applyCount: true,
          organization: { select: { name: true } },
        },
      }),
      this.prisma.opportunity.aggregate({
        _count: { id: true },
        where: {
          AND: [
            { applicationDeadline: { not: null } },
            { applicationDeadline: { gte: new Date() } },
          ],
        },
      }),
    ]);

    return {
      totalViews,
      totalApplies: totalApplies._sum.applyCount || 0,
      topViewed,
      topApplied,
      upcomingDeadlines: deadlineStats._count.id,
    };
  }

  async getSourceAnalytics() {
    const sources = await this.prisma.source.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        status: true,
        totalImported: true,
        totalFailed: true,
        lastRunAt: true,
        lastSuccessAt: true,
        collectorRuns: {
          orderBy: { startedAt: 'desc' },
          take: 5,
          select: {
            status: true,
            itemsImported: true,
            itemsFailed: true,
            duration: true,
            startedAt: true,
          },
        },
      },
      orderBy: { totalImported: 'desc' },
    });

    return sources;
  }

  async getUserAnalytics() {
    const [
      totalUsers,
      newUsersThisMonth,
      activeUsers,
      usersByRole,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
          deletedAt: null,
        },
      }),
      this.prisma.user.count({
        where: {
          lastLoginAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
          deletedAt: null,
        },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
        where: { deletedAt: null },
      }),
    ]);

    return {
      totalUsers,
      newUsersThisMonth,
      activeUsers,
      usersByRole,
    };
  }
}
