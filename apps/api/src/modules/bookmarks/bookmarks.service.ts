import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookmarkDto, UpdateBookmarkDto, BookmarkFilterDto } from './dto/bookmark.dto';
import { calculatePagination } from '../../common/utils';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateBookmarkDto) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_opportunityId: {
          userId,
          opportunityId: createDto.opportunityId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Opportunity already bookmarked');
    }

    return this.prisma.bookmark.create({
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
            organization: { select: { name: true, logoUrl: true } },
          },
        },
      },
    });
  }

  async findAll(userId: string, filters: BookmarkFilterDto) {
    const { page = 1, limit = 20, folder } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (folder) where.folder = folder;

    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmark.findMany({
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
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bookmark.count({ where }),
    ]);

    return {
      data: bookmarks,
      meta: calculatePagination(page, limit, total),
    };
  }

  async findById(userId: string, bookmarkId: string) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId },
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

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  async update(userId: string, bookmarkId: string, updateDto: UpdateBookmarkDto) {
    await this.findById(userId, bookmarkId);

    return this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: updateDto,
    });
  }

  async remove(userId: string, bookmarkId: string) {
    await this.findById(userId, bookmarkId);

    await this.prisma.bookmark.delete({ where: { id: bookmarkId } });
    return { message: 'Bookmark removed successfully' };
  }

  async getByFolder(userId: string) {
    const folders = await this.prisma.bookmark.groupBy({
      by: ['folder'],
      where: { userId },
      _count: { id: true },
    });

    return folders.map((f: any) => ({
      folder: f.folder,
      count: f._count.id,
    }));
  }
}
