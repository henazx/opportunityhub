import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationDto, UpdateLocationDto, LocationFilterDto } from './dto/location.dto';
import { generateSlug, calculatePagination } from '../../common/utils';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLocationDto) {
    const slug = generateSlug(`${createDto.name}-${createDto.country}`);

    const existing = await this.prisma.location.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Location already exists');
    }

    return this.prisma.location.create({
      data: { ...createDto, slug },
    });
  }

  async findAll(filters: LocationFilterDto) {
    const { page = 1, limit = 20, search, country, isRemote } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (country) where.country = country;
    if (isRemote !== undefined) where.isRemote = isRemote;

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        include: { _count: { select: { opportunities: true } } },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.location.count({ where }),
    ]);

    return {
      data: locations,
      meta: calculatePagination(page, limit, total),
    };
  }

  async findCountries() {
    const countries = await this.prisma.location.groupBy({
      by: ['country'],
      _count: { id: true },
      orderBy: { country: 'asc' },
    });

    return countries.map((c: any) => ({
      country: c.country,
      count: c._count.id,
    }));
  }

  async findById(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: { _count: { select: { opportunities: true } } },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async update(id: string, updateDto: UpdateLocationDto) {
    await this.findById(id);

    return this.prisma.location.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findById(id);

    const hasOpportunities = await this.prisma.opportunityLocation.count({
      where: { locationId: id },
    });

    if (hasOpportunities > 0) {
      throw new ConflictException('Cannot delete location with associated opportunities');
    }

    await this.prisma.location.delete({ where: { id } });
    return { message: 'Location deleted successfully' };
  }
}
