'use client';

import useSWR from 'swr';
import { fetcher, ListingRequest } from '../../../lib/api';

const STATUS_STYLES: Record<ListingRequest['status'], string> = {
  pending_review: 'bg-sun/30 text-ink',
  approved: 'bg-marina/20 text-marina-deep',
  rejected: 'bg-bougainvillea/15 text-bougainvillea',
};

export default function MyRequestsPage() {
  const { data: requests, isLoading } = useSWR<ListingRequest[]>('/listing-requests/mine', fetcher);

  if (isLoading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">My listing requests</h1>
      {requests?.length === 0 && <p className="text-ink/60">You haven't submitted any listings yet.</p>}
      {requests?.map((r) => (
        <div key={r.id} className="rounded-lg border border-ink/10 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-ink">{r.title}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}>
              {r.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-ink/60">{r.location}</p>
          {r.status === 'rejected' && r.rejectionReason && (
            <p className="mt-2 text-sm text-bougainvillea">Reason: {r.rejectionReason}</p>
          )}
        </div>
      ))}
    </div>
  );
}
