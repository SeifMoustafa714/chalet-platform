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

  const whatsappUrl = `https://wa.me/20?text=${encodeURIComponent(`I'm interested in ${listing.title}`)}`;

  return (
    <article className="space-y-4">
      {listing.verifiedFlag && <span className="badge-verified">✓ Verified</span>}
      <h1 className="font-display text-3xl font-medium text-ink">{listing.title}</h1>
      <p className="text-ink/60">{listing.location} · up to {listing.maxGuests} guests</p>
      <PriceRange pricing={listing.pricing} />
      <p className="whitespace-pre-line text-ink/80">{listing.description}</p>
      <div className="flex gap-3 pt-2">
        <a href={whatsappUrl} className="btn-accent">Ask on WhatsApp</a>
        <a href={`/bookings/new?listingId=${listing.id}`} className="btn-primary">Request to book</a>
      </div>
    </article>
  );
}
