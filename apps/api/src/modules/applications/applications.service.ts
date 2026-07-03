import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationFilterDto } from './dto/application.dto';
import { calculatePagination } from '../../common/utils';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateApplicationDto) {
    const existing = await this.prisma.application.findUnique({
      where: {
        userId_opportunityId: {
          userId,
          opportunityId: createDto.opportunityId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Application already exists for this opportunity');
    }

    return this.prisma.application.create({
      data: {
        userId,
        ...createDto,
      },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            applicationDeadline: true,
            organization: { select: { name: true, logoUrl: true } },
          },
        },
      },
    });
  }

  async findAll(userId: string, filters: ApplicationFilterDto) {
    const { page = 1, limit = 20, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              applicationDeadline: true,
              isRemote: true,
              organization: { select: { name: true, logoUrl: true, slug: true } },
              category: { select: { name: true } },
              locations: { include: { location: { select: { name: true, country: true } } } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      meta: calculatePagination(page, limit, total),
    };
  }

  async findById(userId: string, applicationId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
      include: {
        opportunity: {
          include: {
            organization: { select: { name: true, logoUrl: true, website: true } },
            category: true,
            tags: { include: { tag: true } },
            locations: { include: { location: true } },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(userId: string, applicationId: string, updateDto: UpdateApplicationDto) {
    await this.findById(userId, applicationId);

    return this.prisma.application.update({
      where: { id: applicationId },
      data: updateDto,
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            type: true,
            organization: { select: { name: true } },
          },
        },
      },
    });
  }

  async remove(userId: string, applicationId: string) {
    await this.findById(userId, applicationId);

    await this.prisma.application.delete({ where: { id: applicationId } });
    return { message: 'Application removed successfully' };
  }

  async getByStatus(userId: string) {
    const statuses = await this.prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
    });

    return statuses.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));
  }
}
