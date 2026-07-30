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
      <section className="-mx-6 -mt-8 bg-gradient-to-b from-marina to-marina-deep px-6 pb-16 pt-14 text-sand">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-sand/70">
            North Coast · Ain Sokhna · Marsa Matrouh · Sharm El Sheikh
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-5xl">
            Every chalet here has already been walked through.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sand/85">
            No listing goes live until our team has reviewed it — the photos, the price, the person
            behind it. What you see is what you'll find at the door.
          </p>
        </div>
      </section>

      <svg className="wave-divider -mt-1" viewBox="0 0 1200 48" preserveAspectRatio="none">
        <path d="M0,24 C150,48 350,0 600,24 C850,48 1050,0 1200,24 L1200,48 L0,48 Z" fill="#EDE7D8" />
      </svg>

      <div className="pt-4">
        {listings.length === 0 ? (
          <p className="text-ink/60">No listings yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
