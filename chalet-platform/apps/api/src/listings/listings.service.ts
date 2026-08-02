import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto, UpdateListingDto } from './dto/admin-listing.dto';

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

  findAllAdmin() {
    return this.prisma.listing.findMany({
      include: { pricing: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id, isActive: true },
      include: {
        pricing: true,
        availability: true,
        reviews: { include: { user: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async findOneAdmin(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { pricing: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async create(adminId: string, dto: CreateListingDto) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.listingRequest.create({
        data: {
          userId: adminId,
          title: dto.title,
          description: dto.description,
          location: dto.location,
          region: dto.region,
          amenities: dto.amenities ?? [],
          maxGuests: dto.maxGuests,
          images: dto.images,
          contactPhone: dto.contactPhone ?? 'N/A',
          status: 'approved',
          reviewedById: adminId,
          reviewedAt: new Date(),
          adminNotes: 'Created directly by admin',
        },
      });

      const listing = await tx.listing.create({
        data: {
          sourceRequestId: request.id,
          title: dto.title,
          description: dto.description,
          location: dto.location,
          region: dto.region,
          amenities: dto.amenities ?? [],
          maxGuests: dto.maxGuests,
          images: dto.images,
          contactPhone: dto.contactPhone,
          approvedById: adminId,
          verifiedFlag: true,
        },
      });

      await tx.pricing.create({
        data: {
          listingId: listing.id,
          basePrice: dto.basePrice,
          weekendPrice: dto.weekendPrice,
          seasonalPrice: dto.seasonalPrice,
        },
      });

      return listing;
    });
  }

  async update(id: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');

    const { basePrice, weekendPrice, seasonalPrice, ...listingFields } = dto;

    await this.prisma.listing.update({ where: { id }, data: listingFields });

    if (basePrice !== undefined || weekendPrice !== undefined || seasonalPrice !== undefined) {
      await this.prisma.pricing.upsert({
        where: { listingId: id },
        create: { listingId: id, basePrice: basePrice ?? 0, weekendPrice, seasonalPrice },
        update: { basePrice, weekendPrice, seasonalPrice },
      });
    }

    return this.findOneAdmin(id);
  }

  async remove(id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');

    const activeBookings = await this.prisma.booking.count({
      where: { listingId: id, status: { in: ['pending', 'confirmed'] } },
    });
    if (activeBookings > 0) {
      throw new BadRequestException(
        'This listing has active bookings. Resolve or cancel them before deleting.',
      );
    }

    return this.prisma.listing.update({ where: { id }, data: { isActive: false } });
  }

  getAvailability(listingId: string) {
    return this.prisma.availability.findMany({
      where: { listingId },
      orderBy: { date: 'asc' },
    });
  }

  toggleAvailability(listingId: string, date: string, isBlocked: boolean) {
    return this.prisma.availability.upsert({
      where: { listingId_date: { listingId, date: new Date(date) } },
      create: { listingId, date: new Date(date), isBlocked },
      update: { isBlocked },
    });
  }

  getReviews(listingId: string) {
    return this.prisma.review.findMany({
      where: { listingId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  addReview(listingId: string, userId: string, rating: number, comment?: string) {
    return this.prisma.review.create({
      data: { listingId, userId, rating, comment },
    });
  }
}
