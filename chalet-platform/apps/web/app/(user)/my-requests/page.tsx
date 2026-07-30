'use client';

import useSWR from 'swr';
import { fetcher, ListingRequest } from '../../../lib/api';

const STATUS_STYLES: Record<ListingRequest['status'], string> = {
  pending_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function MyRequestsPage() {
  const { data: requests, isLoading } = useSWR<ListingRequest[]>('/listing-requests/mine', fetcher);

  if (isLoading) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My listing requests</h1>
      {requests?.length === 0 && <p className="text-gray-500">You haven't submitted any listings yet.</p>}
      {requests?.map((r) => (
        <div key={r.id} className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{r.title}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[r.status]}`}>
              {r.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-gray-500">{r.location}</p>
          {r.status === 'rejected' && r.rejectionReason && (
            <p className="mt-2 text-sm text-red-600">Reason: {r.rejectionReason}</p>
          )}
        </div>
      ))}
    </div>
  );
}
