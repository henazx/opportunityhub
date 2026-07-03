import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto, TagFilterDto } from './dto/tag.dto';
import { generateSlug, calculatePagination } from '../../common/utils';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateTagDto) {
    const slug = generateSlug(createDto.name);

    const existing = await this.prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Tag already exists');
    }

    return this.prisma.tag.create({
      data: { name: createDto.name, slug },
    });
  }

  async findAll(filters: TagFilterDto) {
    const { page = 1, limit = 20, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        orderBy: { usageCount: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.tag.count({ where }),
    ]);

    return {
      data: tags,
      meta: calculatePagination(page, limit, total),
    };
  }

  async findPopular(limit = 20) {
    return this.prisma.tag.findMany({
      orderBy: { usageCount: 'desc' },
      take: limit,
    });
  }

  async findById(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async findOrCreate(name: string) {
    const slug = generateSlug(name);
    const existing = await this.prisma.tag.findUnique({ where: { slug } });
    if (existing) return existing;

    return this.prisma.tag.create({
      data: { name, slug },
    });
  }

  async update(id: string, updateDto: UpdateTagDto) {
    await this.findById(id);

    if (updateDto.name) {
      const slug = generateSlug(updateDto.name);
      const existing = await this.prisma.tag.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Tag already exists');
      }
      (updateDto as any).slug = slug;
    }

    return this.prisma.tag.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prisma.opportunityTag.deleteMany({ where: { tagId: id } });
    await this.prisma.tag.delete({ where: { id } });

    return { message: 'Tag deleted successfully' };
  }
}
