import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOpportunityDto, UpdateOpportunityDto, OpportunityFilterDto } from './dto/opportunity.dto';
import { generateSlug, calculatePagination } from '../../common/utils';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateOpportunityDto) {
    const slug = generateSlug(createDto.title);

    const existing = await this.prisma.opportunity.findUnique({ where: { slug } });
    const uniqueSlug = existing ? `${slug}-${Date.now()}` : slug;

    const { tagIds, locationIds, ...data } = createDto;

    const createData: any = {
      slug: uniqueSlug,
      title: data.title,
      description: data.description,
      type: data.type,
      summary: data.summary,
      url: data.url,
      applicationUrl: data.applicationUrl,
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      salaryCurrency: data.salaryCurrency,
      isRemote: data.isRemote || false,
      sourceId: data.sourceId,
      organizationId: data.organizationId,
      categoryId: data.categoryId,
    };

    if (tagIds && tagIds.length > 0) {
      createData.tags = {
        create: tagIds.map((tagId) => ({ tagId })),
      };
    }

    if (locationIds && locationIds.length > 0) {
      createData.locations = {
        create: locationIds.map((locationId) => ({ locationId })),
      };
    }

    const opportunity = await this.prisma.opportunity.create({
      data: createData,
      include: {
        source: { select: { id: true, name: true, url: true } },
        organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: true } },
        locations: { include: { location: true } },
      },
    });

    return opportunity;
  }

  async findAll(filters: OpportunityFilterDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      type,
      categoryId,
      organizationId,
      locationId,
      tag,
      isRemote,
      isFeatured,
      deadlineFrom,
      deadlineTo,
      salaryMin,
      salaryMax,
      verifiedOnly,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      deletedAt: null,
      OR: [
        { applicationDeadline: null },
        { applicationDeadline: { gte: new Date() } },
      ],
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (organizationId) where.organizationId = organizationId;
    if (isRemote !== undefined) where.isRemote = isRemote;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    if (locationId) {
      where.locations = { some: { locationId } };
    }

    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }

    if (deadlineFrom || deadlineTo) {
      where.applicationDeadline = {};
      if (deadlineFrom) where.applicationDeadline.gte = new Date(deadlineFrom);
      if (deadlineTo) where.applicationDeadline.lte = new Date(deadlineTo);
    }

    if (salaryMin !== undefined || salaryMax !== undefined) {
      where.AND = where.AND || [];
      if (salaryMin !== undefined) {
        where.AND.push({ salaryMax: { gte: salaryMin } });
      }
      if (salaryMax !== undefined) {
        where.AND.push({ salaryMin: { lte: salaryMax } });
      }
    }

    if (verifiedOnly) {
      where.linkStatus = 'valid';
    }

    const [opportunities, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        include: {
          source: { select: { id: true, name: true } },
          organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
          locations: { include: { location: { select: { id: true, name: true, country: true, city: true } } } },
          _count: { select: { bookmarks: true } },
        },
        skip,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' },
          { [sortBy]: sortOrder },
        ],
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return {
      data: opportunities,
      meta: calculatePagination(page, limit, total),
    };
  }

  async findById(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        source: true,
        organization: {
          include: { _count: { select: { opportunities: true } } },
        },
        category: true,
        tags: { include: { tag: true } },
        locations: { include: { location: true } },
        _count: { select: { bookmarks: true, viewHistory: true } },
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    await this.prisma.opportunity.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return opportunity;
  }

  async findBySlug(slug: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { slug },
      include: {
        source: { select: { id: true, name: true, url: true } },
        organization: { select: { id: true, name: true, slug: true, logoUrl: true, website: true } },
        category: true,
        tags: { include: { tag: true } },
        locations: { include: { location: true } },
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    return opportunity;
  }

  async update(id: string, updateDto: UpdateOpportunityDto) {
    await this.findById(id);

    const { tagIds, locationIds, ...data } = updateDto;

    const updateData: any = { ...data };

    if (tagIds) {
      await this.prisma.opportunityTag.deleteMany({ where: { opportunityId: id } });
      if (tagIds.length > 0) {
        updateData.tags = {
          create: tagIds.map((tagId) => ({ tagId })),
        };
      }
    }

    if (locationIds) {
      await this.prisma.opportunityLocation.deleteMany({ where: { opportunityId: id } });
      if (locationIds.length > 0) {
        updateData.locations = {
          create: locationIds.map((locationId) => ({ locationId })),
        };
      }
    }

    return this.prisma.opportunity.update({
      where: { id },
      data: updateData,
      include: {
        source: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true } },
        category: true,
        tags: { include: { tag: true } },
        locations: { include: { location: true } },
      },
    });
  }

  async softDelete(id: string) {
    await this.findById(id);

    await this.prisma.opportunity.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Opportunity deleted successfully' };
  }

  async getStats() {
    const [total, byType, recentImports] = await Promise.all([
      this.prisma.opportunity.count({ where: { isActive: true } }),
      this.prisma.opportunity.groupBy({
        by: ['type'],
        _count: { id: true },
        where: { isActive: true },
      }),
      this.prisma.opportunity.findMany({
        where: { isActive: true },
        orderBy: { importedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          type: true,
          importedAt: true,
          organization: { select: { name: true } },
        },
      }),
    ]);

    return {
      total,
      byType: byType.map((item: any) => ({
        type: item.type,
        count: item._count.id,
      })),
      recentImports,
    };
  }
}
