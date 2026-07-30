import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '../lib/api';
import { PriceRange } from './PriceRange';

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block overflow-hidden rounded-xl border border-ink/10 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-48 w-full bg-sand">
        {listing.images[0] && (
          <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
        )}
        {listing.verifiedFlag && (
          <span className="badge-verified absolute left-3 top-3">✓ Verified</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-medium text-ink">{listing.title}</h3>
        <p className="mt-0.5 text-sm text-ink/60">{listing.location} · up to {listing.maxGuests} guests</p>
        <div className="mt-2"><PriceRange pricing={listing.pricing} /></div>
      </div>
    </Link>
  );
}
