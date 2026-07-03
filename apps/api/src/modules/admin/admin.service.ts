import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { calculatePagination } from '../../common/utils';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      usersByRole,
      totalOrganizations,
      verifiedOrganizations,
      totalOpportunities,
      opportunitiesByType,
      totalSources,
      sourcesByStatus,
      totalBookmarks,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
        where: { deletedAt: null },
      }),
      this.prisma.organization.count({ where: { deletedAt: null } }),
      this.prisma.organization.count({ where: { isVerified: true, deletedAt: null } }),
      this.prisma.opportunity.count({ where: { deletedAt: null } }),
      this.prisma.opportunity.groupBy({
        by: ['type'],
        _count: { id: true },
        where: { deletedAt: null },
      }),
      this.prisma.source.count({ where: { deletedAt: null } }),
      this.prisma.source.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null },
      }),
      this.prisma.bookmark.count(),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    return {
      users: { total: totalUsers, byRole: usersByRole },
      organizations: { total: totalOrganizations, verified: verifiedOrganizations },
      opportunities: { total: totalOpportunities, byType: opportunitiesByType },
      sources: { total: totalSources, byStatus: sourcesByStatus },
      bookmarks: { total: totalBookmarks },
      recentAuditLogs,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string, role?: UserRole) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: calculatePagination(page, limit, total),
    };
  }

  async updateUserRole(userId: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });
  }

  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      meta: calculatePagination(page, limit, total),
    };
  }
}
