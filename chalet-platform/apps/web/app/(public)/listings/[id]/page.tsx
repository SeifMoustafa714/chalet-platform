import type { Metadata } from 'next';
import { ListingDetailClient } from './ListingDetailClient';

interface ListingSeoData {
  title: string;
  description: string;
  location: string;
  images: string[];
}

async function getListingForSeo(id: string): Promise<ListingSeoData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListingForSeo(params.id);
  if (!listing) return { title: 'Chalet — Coastly' };

  const description = listing.description.length > 155
    ? listing.description.slice(0, 152) + '...'
    : listing.description;

  return {
    title: `${listing.title} — ${listing.location} | Coastly`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: listing.images?.[0] ? [listing.images[0]] : undefined,
    },
  };
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return <ListingDetailClient id={params.id} />;
}
