import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calculatePagination } from '../../common/utils';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, filters: any = {}) {
    const { page = 1, limit = 20, type, categoryId, locationId, isRemote } = filters;
    const skip = (page - 1) * limit;
    const now = new Date();

    const deadlineFilter = {
      OR: [
        { applicationDeadline: null },
        { applicationDeadline: { gte: now } },
      ],
    };

    const searchFilter = {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { summary: { contains: query, mode: 'insensitive' as const } },
        { tags: { some: { tag: { name: { contains: query, mode: 'insensitive' as const } } } } },
        { organization: { name: { contains: query, mode: 'insensitive' as const } } },
      ],
    };

    const where: any = {
      isActive: true,
      deletedAt: null,
      AND: [deadlineFilter, searchFilter],
    };

    if (type) where.AND.push({ type });
    if (categoryId) where.AND.push({ categoryId });
    if (isRemote !== undefined) where.AND.push({ isRemote });
    if (locationId) {
      where.AND.push({ locations: { some: { locationId } } });
    }

    const [results, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        include: {
          organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
          locations: { include: { location: { select: { id: true, name: true, country: true } } } },
        },
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { viewCount: 'desc' }],
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return {
      data: results,
      meta: calculatePagination(page, limit, total),
      query,
    };
  }

  async getSearchSuggestions(query: string) {
    const now = new Date();
    const [opportunities, tags, organizations] = await Promise.all([
      this.prisma.opportunity.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          AND: [
            {
              OR: [
                { applicationDeadline: null },
                { applicationDeadline: { gte: now } },
              ],
            },
            { title: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, type: true },
        take: 5,
      }),
      this.prisma.tag.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: { id: true, name: true, slug: true },
        take: 5,
      }),
      this.prisma.organization.findMany({
        where: {
          isActive: true,
          name: { contains: query, mode: 'insensitive' },
        },
        select: { id: true, name: true, slug: true },
        take: 5,
      }),
    ]);

    return { opportunities, tags, organizations };
  }

  async getPopularSearches() {
    const searches = await this.prisma.searchHistory.groupBy({
      by: ['query'],
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: 10,
    });

    return searches.map((s) => ({
      query: s.query,
      count: s._count.query,
    }));
  }

  async saveSearchHistory(query: string, userId?: string, resultCount: number = 0) {
    return this.prisma.searchHistory.create({
      data: {
        query,
        userId,
        resultCount,
      },
    });
  }
}
