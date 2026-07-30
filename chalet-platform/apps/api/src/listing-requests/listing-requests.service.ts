import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingRequestDto } from './dto/create-listing-request.dto';
import { ReviewEditDto } from './dto/review-listing-request.dto';

@Injectable()
export class ListingRequestsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateListingRequestDto) {
    return this.prisma.listingRequest.create({
      data: { ...dto, userId },
    });
  }

  findMine(userId: string) {
    return this.prisma.listingRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll(status?: 'pending_review' | 'approved' | 'rejected') {
    return this.prisma.listingRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, fullName: true, email: true, role: true } } },
    });
  }

  async findOne(id: string, requester: { userId: string; role: string }) {
    const request = await this.prisma.listingRequest.findUnique({
      where: { id },
      include: { user: true, listing: true },
    });
    if (!request) throw new NotFoundException('Listing request not found');

    // owners can view their own; admins can view any
    if (requester.role !== 'ADMIN' && request.userId !== requester.userId) {
      throw new ForbiddenException();
    }
    return request;
  }

  async update(id: string, dto: ReviewEditDto) {
    const request = await this.prisma.listingRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Listing request not found');
    if (request.status !== 'pending_review') {
      throw new BadRequestException('Only pending requests can be edited');
    }
    return this.prisma.listingRequest.update({ where: { id }, data: dto });
  }

  /**
   * Approve: converts a ListingRequest into a brand-new Listing row.
   * Runs in a transaction so the request is never left "approved" without
   * a corresponding live listing, or vice versa.
   */
  async approve(id: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.listingRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException('Listing request not found');
      if (request.status !== 'pending_review') {
        throw new BadRequestException('Only pending requests can be approved');
      }

      const listing = await tx.listing.create({
        data: {
          sourceRequestId: request.id,
          title: request.title,
          description: request.description,
          location: request.location,
          region: request.region,
          amenities: request.amenities,
          maxGuests: request.maxGuests,
          images: request.images,
          approvedById: adminId,
          verifiedFlag: true,
        },
      });

      // seed pricing from the request's indicative range so it's not empty on go-live
      await tx.pricing.create({
        data: {
          listingId: listing.id,
          basePrice: request.priceMin ?? 0,
          weekendPrice: request.priceMax ?? undefined,
        },
      });

      await tx.listingRequest.update({
        where: { id },
        data: { status: 'approved', reviewedById: adminId, reviewedAt: new Date() },
      });

      return listing;
    });
  }

  async reject(id: string, adminId: string, reason: string) {
    const request = await this.prisma.listingRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Listing request not found');
    if (request.status !== 'pending_review') {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    const updated = await this.prisma.listingRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    // TODO: notify request.user (email / WhatsApp) with `reason`
    return updated;
  }
}
