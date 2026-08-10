import type { MetadataRoute } from 'next';

interface Listing {
  id: string;
  updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

  let listings: Listing[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`, { next: { revalidate: 300 } });
    if (res.ok) listings = await res.json();
  } catch {
    // If the API is briefly unreachable, still return the static pages below.
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${siteUrl}/listings/${l.id}`,
    lastModified: l.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...listingPages];
}
