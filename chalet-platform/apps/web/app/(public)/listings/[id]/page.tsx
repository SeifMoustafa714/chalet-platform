import { PriceRange } from '../../../../components/PriceRange';
import { Listing } from '../../../../lib/api';

async function getListing(id: string): Promise<Listing | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) return <p>Listing not found.</p>;

  return (
    <article className="space-y-4">
      <h1 className="text-2xl font-bold">{listing.title}</h1>
      <p className="text-gray-500">{listing.location} · up to {listing.maxGuests} guests</p>
      <PriceRange pricing={listing.pricing} />
      <p className="whitespace-pre-line">{listing.description}</p>
      <a
        href={`https://wa.me/20${''}?text=${encodeURIComponent(`I'm interested in ${listing.title}`)}`}
        className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-white"
      >
        Ask on WhatsApp
      </a>
      <a
        href={`/bookings/new?listingId=${listing.id}`}
        className="ml-3 inline-block rounded-lg bg-sky-600 px-4 py-2 text-white"
      >
        Request to book
      </a>
    </article>
  );
}
