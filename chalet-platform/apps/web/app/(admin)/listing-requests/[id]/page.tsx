'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api, fetcher, ListingRequest } from '../../../../lib/api';

export default function ReviewListingRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: request, mutate } = useSWR<ListingRequest>(`/listing-requests/${params.id}`, fetcher);
  const [draft, setDraft] = useState<Partial<ListingRequest>>({});
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (request) setDraft(request);
  }, [request]);

  if (!request) return <p>Loading…</p>;

  async function handleApprove() {
    setBusy(true);
    try {
      // save any admin edits first, then approve
      await api.patch(`/listing-requests/${params.id}`, {
        title: draft.title,
        description: draft.description,
        location: draft.location,
        region: draft.region,
        maxGuests: draft.maxGuests,
      });
      await api.post(`/listing-requests/${params.id}/approve`);
      router.push('/listing-requests');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setBusy(true);
    try {
      await api.post(`/listing-requests/${params.id}/reject`, { reason: rejectReason });
      router.push('/listing-requests');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Review listing request</h1>

      <input className="w-full rounded border p-2" value={draft.title ?? ''}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })} />

      <textarea className="w-full rounded border p-2" rows={4} value={draft.description ?? ''}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })} />

      <input className="w-full rounded border p-2" value={draft.location ?? ''}
        onChange={(e) => setDraft({ ...draft, location: e.target.value })} />

      <div className="flex gap-3">
        {request.images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img} src={img} alt="" className="h-24 w-24 rounded object-cover" />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button disabled={busy} onClick={handleApprove}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-50">
          Approve &amp; publish
        </button>
      </div>

      <div className="border-t pt-4">
        <textarea placeholder="Rejection reason (sent to submitter)" className="w-full rounded border p-2"
          value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        <button disabled={busy || !rejectReason.trim()} onClick={handleReject}
          className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50">
          Reject
        </button>
      </div>
    </div>
  );
}
