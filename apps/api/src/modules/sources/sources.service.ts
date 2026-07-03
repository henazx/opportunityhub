import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSourceDto, UpdateSourceDto, SourceFilterDto } from './dto/source.dto';
import { calculatePagination } from '../../common/utils';

@Injectable()
export class SourcesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSourceDto) {
    return this.prisma.source.create({
      data: createDto,
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { opportunities: true, collectorRuns: true } },
      },
    });
  }

  async findAll(filters: SourceFilterDto) {
    const { page = 1, limit = 20, search, status, collectorType } = filters;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (collectorType) where.collectorType = collectorType;

    const [sources, total] = await Promise.all([
      this.prisma.source.findMany({
        where,
        include: {
          organization: { select: { id: true, name: true } },
          _count: { select: { opportunities: true, collectorRuns: true } },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.source.count({ where }),
    ]);

    return {
      data: sources,
      meta: calculatePagination(page, limit, total),
    };
  }

  async findById(id: string) {
    const source = await this.prisma.source.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true } },
        collectorRuns: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        _count: { select: { opportunities: true } },
      },
    });

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    return source;
  }

  async update(id: string, updateDto: UpdateSourceDto) {
    await this.findById(id);

    return this.prisma.source.update({
      where: { id },
      data: updateDto,
    });
  }

  async softDelete(id: string) {
    await this.findById(id);

    await this.prisma.source.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Source deleted successfully' };
  }

  async getStats() {
    const [total, active, error, totalImported] = await Promise.all([
      this.prisma.source.count({ where: { deletedAt: null } }),
      this.prisma.source.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.source.count({ where: { status: 'ERROR', deletedAt: null } }),
      this.prisma.source.aggregate({ _sum: { totalImported: true }, where: { deletedAt: null } }),
    ]);

    return {
      total,
      active,
      error,
      totalImported: totalImported._sum.totalImported || 0,
    };
  }
}
