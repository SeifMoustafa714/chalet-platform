'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ListingCard } from '../../components/ListingCard';
import { fetcher, Listing, Region } from '../../lib/api';

const REGIONS: { value: Region | ''; label: string }[] = [
  { value: '', label: 'All regions' },
  { value: 'north_coast', label: 'North Coast' },
  { value: 'ain_sokhna', label: 'Ain Sokhna' },
  { value: 'marsa_matrouh', label: 'Marsa Matrouh' },
  { value: 'sharm', label: 'Sharm El Sheikh' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (region) query.set('region', region);
  if (minPrice) query.set('minPrice', minPrice);
  if (maxPrice) query.set('maxPrice', maxPrice);

  const { data: listings, isLoading } = useSWR<Listing[]>(`/listings?${query.toString()}`, fetcher);

  const hasFilters = search || region || minPrice || maxPrice;

  function clearFilters() {
    setSearch('');
    setRegion('');
    setMinPrice('');
    setMaxPrice('');
  }

  return (
    <div>
      <section className="relative -mx-6 -mt-8 overflow-hidden bg-gradient-to-b from-marina via-marina to-marina-deep px-6 pb-20 pt-14 text-sand">
        <div className="hero-sun-glow pointer-events-none absolute inset-0" />

        <svg className="hero-wave-drift pointer-events-none absolute bottom-0 left-0 w-[130%] opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C200,110 400,10 600,60 C800,110 1000,10 1200,60 L1200,120 L0,120 Z" fill="#EDE7D8" />
        </svg>
        <svg className="hero-wave-drift pointer-events-none absolute bottom-0 left-0 w-[130%] opacity-10" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ animationDelay: '-9s' }}>
          <path d="M0,80 C300,20 500,120 800,60 C1000,20 1100,90 1200,70 L1200,120 L0,120 Z" fill="#D9A441" />
        </svg>

        <div className="hero-fade-in relative mx-auto max-w-3xl text-center">
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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white p-4">
          <span className="text-xl">✓</span>
          <div>
            <p className="font-medium text-ink">Every listing reviewed</p>
            <p className="text-sm text-ink/60">Admin-checked before it ever goes public.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white p-4">
          <span className="text-xl">🔒</span>
          <div>
            <p className="font-medium text-ink">Secure InstaPay payments</p>
            <p className="text-sm text-ink/60">Nothing charged until your booking is confirmed.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white p-4">
          <span className="text-xl">★</span>
          <div>
            <p className="font-medium text-ink">Real reviews only</p>
            <p className="text-sm text-ink/60">Only confirmed guests can leave a rating.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-ink/10 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Search by name or location…"
            className="min-w-[200px] flex-1 rounded border border-ink/20 p-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded border border-ink/20 p-2 text-sm"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <input
            placeholder="Min EGP"
            type="number"
            className="w-28 rounded border border-ink/20 p-2 text-sm"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            placeholder="Max EGP"
            type="number"
            className="w-28 rounded border border-ink/20 p-2 text-sm"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-marina">Clear filters</button>
          )}
        </div>
      </div>

      <div className="pt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-ink/10 bg-white">
                <div className="skeleton h-48 w-full" />
                <div className="space-y-2 p-4">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings?.length === 0 ? (
          <p className="text-ink/60">
            {hasFilters ? 'No chalets match those filters — try widening your search.' : 'No listings yet — check back soon.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings?.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
