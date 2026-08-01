'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { fetcher, ListingRequest } from '../../../lib/api';

export default function AdminListingRequestsPage() {
  const { data: requests, isLoading } = useSWR<ListingRequest[]>('/listing-requests?status=pending_review', fetcher);

  if (isLoading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-medium text-ink">Listing requests — pending review</h1>
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-sand/50 text-ink/60">
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Location</th>
              <th className="px-4 py-2 font-medium">Submitted</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {requests?.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink/50">Nothing pending review.</td></tr>
            )}
            {requests?.map((r) => (
              <tr key={r.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">{r.title}</td>
                <td className="px-4 py-3 text-ink/60">{r.location}</td>
                <td className="px-4 py-3 text-ink/60">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/listing-requests/${r.id}`} className="text-marina">Review →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
