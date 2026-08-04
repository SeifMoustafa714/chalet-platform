'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api, fetcher } from '../../../lib/api';

interface AdminReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  listing: { title: string };
  user: { fullName: string; email: string; phone?: string };
}

export default function AdminReviewsPage() {
  const { data: reviews, isLoading, mutate } = useSWR<AdminReview[]>('/reviews', fetcher);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Delete this review?')) return;
    setBusyId(id);
    try {
      await api.delete(`/reviews/${id}`);
      mutate();
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-medium text-ink">Reviews</h1>
      <div className="space-y-3">
        {reviews?.length === 0 && <p className="text-ink/60">No reviews yet.</p>}
        {reviews?.map((r) => (
          <div key={r.id} className="rounded-lg border border-ink/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-medium text-ink">{r.listing.title}</p>
                <p className="text-sm text-ink/60">
                  {r.user.fullName} · {r.user.email}{r.user.phone ? ` · ${r.user.phone}` : ''}
                </p>
              </div>
              <span className="font-mono text-ink/70">★ {r.rating}</span>
            </div>
            {r.comment && <p className="mt-2 text-sm text-ink/70">{r.comment}</p>}
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-ink/40">{new Date(r.createdAt).toLocaleDateString()}</p>
              <button
                disabled={busyId === r.id}
                onClick={() => handleDelete(r.id)}
                className="text-sm text-bougainvillea disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
