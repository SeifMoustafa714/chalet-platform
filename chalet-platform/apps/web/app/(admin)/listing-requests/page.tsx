'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { fetcher, ListingRequest } from '../../../lib/api';

export default function AdminListingRequestsPage() {
  const { data: requests, isLoading } = useSWR<ListingRequest[]>('/listing-requests?status=pending_review', fetcher);

  if (isLoading) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Listing requests — pending review</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2">Title</th>
            <th>Location</th>
            <th>Submitted</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {requests?.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="py-2">{r.title}</td>
              <td>{r.location}</td>
              <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              <td>
                <Link href={`/listing-requests/${r.id}`} className="text-sky-600">
                  Review →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
