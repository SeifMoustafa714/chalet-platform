'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { fetcher } from '../../../lib/api';

interface MyBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  quotedPrice?: string;
  listing: { title: string };
  payment?: { status: string };
}

const STATUS_STYLES: Record<MyBooking['status'], string> = {
  pending: 'bg-sun/30 text-ink',
  confirmed: 'bg-marina/20 text-marina-deep',
  rejected: 'bg-bougainvillea/15 text-bougainvillea',
  cancelled: 'bg-ink/10 text-ink/50',
};

export default function MyBookingsPage() {
  const { data: bookings, isLoading } = useSWR<MyBooking[]>('/bookings/mine', fetcher);

  if (isLoading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">My bookings</h1>
      {bookings?.length === 0 && <p className="text-ink/60">No booking requests yet.</p>}
      {bookings?.map((b) => (
        <Link
          key={b.id}
          href={`/my-bookings/${b.id}`}
          className="block rounded-lg border border-ink/10 bg-white p-4 transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-ink">{b.listing.title}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status]}`}>
              {b.payment?.status === 'verified' ? 'confirmed ✓' : b.status}
            </span>
          </div>
          <p className="font-mono text-xs text-ink/40">Booking #{b.id.slice(0, 8)}</p>
          <p className="mt-1 text-sm text-ink/60">
            {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()} · {b.guests} guests
          </p>
          {b.status === 'confirmed' && b.payment?.status !== 'verified' && (
            <p className="mt-2 text-sm text-marina">→ View price and pay</p>
          )}
        </Link>
      ))}
    </div>
  );
}
