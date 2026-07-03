import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationFilterDto } from './dto/organization.dto';
import { generateSlug, calculatePagination } from '../../common/utils';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateOrganizationDto, userId: string) {
    const slug = generateSlug(createDto.name);

    const existing = await this.prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Organization with this name already exists');
    }

    const organization = await this.prisma.organization.create({
      data: {
        ...createDto,
        slug,
        members: {
          create: {
            userId,
            role: 'ORGANIZATION',
            isOwner: true,
          },
        },
      },
      include: { members: true },
    });

    return organization;
  }

  async findAll(filters: OrganizationFilterDto) {
    const { page = 1, limit = 20, search, industry, isVerified } = filters;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry) where.industry = industry;
    if (isVerified !== undefined) where.isVerified = isVerified;

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        include: {
          _count: { select: { opportunities: true, members: true } },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      data: organizations,
      meta: calculatePagination(page, limit, total),
    };
  }

  async findById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true },
            },
          },
        },
        _count: { select: { opportunities: true } },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        _count: { select: { opportunities: true } },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(id: string, updateDto: UpdateOrganizationDto) {
    await this.findById(id);

    return this.prisma.organization.update({
      where: { id },
      data: updateDto,
    });
  }

  async softDelete(id: string) {
    await this.findById(id);

    await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Organization deleted successfully' };
  }
}
