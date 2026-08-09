'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { fetcher, ListingRequest } from '../../../lib/api';

const TABS = [
  { value: 'pending_review', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: '', label: 'All' },
] as const;

export default function AdminListingRequestsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('pending_review');
  const [search, setSearch] = useState('');

  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (search) query.set('search', search);

  const { data: requests, isLoading } = useSWR<ListingRequest[]>(`/listing-requests?${query.toString()}`, fetcher);

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-medium text-ink">Listing requests</h1>

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
          placeholder="Search title, location, submitter…"
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
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Submitted by</th>
              <th className="px-4 py-2 font-medium">Location</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-ink/50">Loading…</td></tr>
            )}
            {!isLoading && requests?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-ink/50">Nothing here.</td></tr>
            )}
            {requests?.map((r, i) => (
              <tr
                key={r.id}
                onClick={() => router.push(`/listing-requests/${r.id}`)}
                className="cursor-pointer border-b border-ink/5 last:border-0 hover:bg-sand/40"
              >
                <td className="px-4 py-3 text-ink/40">{i + 1}</td>
                <td className="px-4 py-3 text-ink">{r.title}</td>
                <td className="px-4 py-3 text-ink/60">{r.user?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-ink/60">{r.location}</td>
                <td className="px-4 py-3 text-ink/60">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.status === 'pending_review' ? 'bg-sun/30 text-ink'
                    : r.status === 'approved' ? 'bg-marina/20 text-marina-deep'
                    : 'bg-bougainvillea/15 text-bougainvillea'
                  }`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
