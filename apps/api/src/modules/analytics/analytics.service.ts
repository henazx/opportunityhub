import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackPageView(data: {
    path: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  }) {
    return this.prisma.pageView.create({
      data: {
        path: data.path,
        userId: data.userId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        referrer: data.referrer || null,
      },
    });
  }

  async getVisitorStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalVisitors, todayVisitors, weekVisitors, monthVisitors, uniqueVisitors, topPages, visitorsByDay] =
      await Promise.all([
        this.prisma.pageView.count(),
        this.prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
        this.prisma.pageView.count({ where: { createdAt: { gte: weekAgo } } }),
        this.prisma.pageView.count({ where: { createdAt: { gte: monthAgo } } }),
        this.prisma.pageView.findMany({
          select: { userId: true, ipAddress: true },
          distinct: ['userId', 'ipAddress'],
        }),
        this.prisma.pageView.groupBy({
          by: ['path'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        this.prisma.$queryRaw`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM page_views
          WHERE created_at >= ${weekAgo}
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `,
      ]);

    return {
      totalPageViews: totalVisitors,
      todayPageViews: todayVisitors,
      thisWeekPageViews: weekVisitors,
      thisMonthPageViews: monthVisitors,
      uniqueVisitors: uniqueVisitors.length,
      topPages,
      visitorsByDay,
    };
  }

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
