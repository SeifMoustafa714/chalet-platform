'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { api, fetcher } from '../../../lib/api';

interface AdminListing {
  id: string;
  title: string;
  location: string;
  isActive: boolean;
  verifiedFlag: boolean;
  pricing?: { basePrice: string };
}

export default function AdminListingsPage() {
  const { data: listings, isLoading, mutate } = useSWR<AdminListing[]>('/listings/admin/all', fetcher);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Remove this listing from the public site?')) return;
    setBusyId(id);
    setError(null);
    try {
      await api.delete(`/listings/${id}`);
      mutate();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not delete — it may have active bookings.');
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink">Listings</h1>
        <Link href="/listings/new" className="btn-primary">+ Add listing</Link>
      </div>

      {error && <p className="mb-3 text-sm text-bougainvillea">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-sand/50 text-ink/60">
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Location</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {listings?.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink/50">No listings yet.</td></tr>
            )}
            {listings?.map((l) => (
              <tr key={l.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">{l.title}</td>
                <td className="px-4 py-3 text-ink/60">{l.location}</td>
                <td className="px-4 py-3 font-mono text-ink/60">
                  {l.pricing ? `${Number(l.pricing.basePrice).toLocaleString()} EGP` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    l.isActive ? 'bg-marina/20 text-marina-deep' : 'bg-ink/10 text-ink/50'
                  }`}>
                    {l.isActive ? 'live' : 'hidden'}
                  </span>
                </td>
                <td className="space-x-3 px-4 py-3">
                  <Link href={`/listings/${l.id}/edit`} className="text-marina">Edit</Link>
                  {l.isActive && (
                    <button
                      disabled={busyId === l.id}
                      onClick={() => handleDelete(l.id)}
                      className="text-bougainvillea disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
