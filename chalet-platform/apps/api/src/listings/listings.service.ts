import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { region?: string; guests?: number; minPrice?: number; maxPrice?: number }) {
    return this.prisma.listing.findMany({
      where: {
        isActive: true,
        region: filters.region,
        maxGuests: filters.guests ? { gte: filters.guests } : undefined,
        pricing: filters.minPrice || filters.maxPrice
          ? {
              basePrice: {
                gte: filters.minPrice ?? undefined,
                lte: filters.maxPrice ?? undefined,
              },
            }
          : undefined,
      },
      include: { pricing: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id, isActive: true },
      include: { pricing: true, availability: true, reviews: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }
}
