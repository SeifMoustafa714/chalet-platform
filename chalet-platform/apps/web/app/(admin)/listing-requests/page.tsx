'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { api, fetcher, ListingRequest } from '../../../lib/api';

export default function AdminListingRequestsPage() {
  const { data: requests, isLoading, mutate } = useSWR<ListingRequest[]>('/listing-requests?status=pending_review', fetcher);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Delete this request?')) return;
    setBusyId(id);
    try {
      await api.delete(`/listing-requests/${id}`);
      mutate();
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-medium text-ink">Listing requests — pending review</h1>
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-sand/50 text-ink/60">
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Submitted by</th>
              <th className="px-4 py-2 font-medium">Location</th>
              <th className="px-4 py-2 font-medium">Submitted</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {requests?.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink/50">Nothing pending review.</td></tr>
            )}
            {requests?.map((r) => (
              <tr key={r.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">{r.title}</td>
                <td className="px-4 py-3 text-ink/60">{r.user?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-ink/60">{r.location}</td>
                <td className="px-4 py-3 text-ink/60">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/listing-requests/${r.id}`} className="text-marina">Review →</Link>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => handleDelete(r.id)}
                    className="ml-3 text-bougainvillea disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
