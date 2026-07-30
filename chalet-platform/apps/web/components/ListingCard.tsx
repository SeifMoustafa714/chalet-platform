import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '../lib/api';
import { PriceRange } from './PriceRange';

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`} className="block overflow-hidden rounded-xl border bg-white hover:shadow-md transition">
      <div className="relative h-48 w-full bg-gray-100">
        {listing.images[0] && (
          <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
        )}
        {listing.verifiedFlag && (
          <span className="absolute top-2 left-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">Verified</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{listing.title}</h3>
        <p className="text-sm text-gray-500">{listing.location} · up to {listing.maxGuests} guests</p>
        <div className="mt-2"><PriceRange pricing={listing.pricing} /></div>
      </div>
    </Link>
  );
}
