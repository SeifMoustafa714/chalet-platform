'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { fetcher } from '../../../lib/api';

interface AdminBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  listing: { title: string };
  user: { fullName: string };
  payment?: { status: string };
}

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: '', label: 'All' },
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-sun/30 text-ink',
  confirmed: 'bg-marina/20 text-marina-deep',
  rejected: 'bg-bougainvillea/15 text-bougainvillea',
  cancelled: 'bg-ink/10 text-ink/50',
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('pending');
  const [search, setSearch] = useState('');

  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (search) query.set('search', search);

  const { data: bookings, isLoading } = useSWR<AdminBooking[]>(`/bookings?${query.toString()}`, fetcher);

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-medium text-ink">Bookings</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-ink/10 bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setStatus(t.value)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                status === t.value ? 'bg-marina text-white' : 'text-ink/60 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          placeholder="Search guest, email, listing…"
          className="w-64 rounded border border-ink/20 p-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-sand/50 text-ink/60">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Ref</th>
              <th className="px-4 py-2 font-medium">Guest</th>
              <th className="px-4 py-2 font-medium">Listing</th>
              <th className="px-4 py-2 font-medium">Dates</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-ink/50">Loading…</td></tr>
            )}
            {!isLoading && bookings?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-ink/50">Nothing here.</td></tr>
            )}
            {bookings?.map((b, i) => {
              const isConfirmedAndPaid = b.status === 'confirmed' && b.payment?.status === 'verified';
              return (
                <tr
                  key={b.id}
                  onClick={() => router.push(`/bookings/${b.id}`)}
                  className="cursor-pointer border-b border-ink/5 last:border-0 hover:bg-sand/40"
                >
                  <td className="px-4 py-3 text-ink/40">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/50">#{b.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-ink">{b.user.fullName}</td>
                  <td className="px-4 py-3 text-ink/70">{b.listing.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/60">
                    {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status]}`}>
                      {isConfirmedAndPaid ? 'confirmed ✓' : b.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
