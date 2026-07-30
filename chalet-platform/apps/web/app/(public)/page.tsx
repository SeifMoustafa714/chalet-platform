import { ListingCard } from '../../components/ListingCard';
import { Listing } from '../../lib/api';

async function getListings(): Promise<Listing[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const listings = await getListings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Verified chalets across Egypt's coast</h1>
      {listings.length === 0 ? (
        <p className="text-gray-500">No listings yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
