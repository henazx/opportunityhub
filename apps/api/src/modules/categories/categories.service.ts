import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFilterDto } from './dto/category.dto';
import { generateSlug, calculatePagination } from '../../common/utils';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCategoryDto) {
    const slug = generateSlug(createDto.name);

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.category.create({
      data: { ...createDto, slug },
    });
  }

  async findAll(filters: CategoryFilterDto) {
    const { page = 1, limit = 20, search, parentId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (parentId !== undefined) where.parentId = parentId;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: {
          _count: { select: { children: true, opportunities: true } },
        },
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: calculatePagination(page, limit, total),
    };
  }

  async findTree() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              include: {
                _count: { select: { opportunities: true } },
              },
            },
            _count: { select: { opportunities: true } },
          },
        },
        _count: { select: { opportunities: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories;
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: { _count: { select: { opportunities: true } } },
        },
        _count: { select: { opportunities: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        _count: { select: { opportunities: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateDto: UpdateCategoryDto) {
    await this.findById(id);

    if (updateDto.name) {
      const slug = generateSlug(updateDto.name);
      const existing = await this.prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
      (updateDto as any).slug = slug;
    }

    return this.prisma.category.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findById(id);

    const hasOpportunities = await this.prisma.opportunity.count({
      where: { categoryId: id },
    });

    if (hasOpportunities > 0) {
      throw new ConflictException('Cannot delete category with associated opportunities');
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
}
