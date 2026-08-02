'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api, fetcher, ListingRequest } from '../../../../lib/api';

export default function ReviewListingRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: request, error: fetchError } = useSWR<ListingRequest>(`/listing-requests/${params.id}`, fetcher);
  const [draft, setDraft] = useState<Partial<ListingRequest>>({});
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (request) setDraft(request);
  }, [request]);

  if (!request) return <p className="text-ink/60">Loading…</p>;

  async function handleApprove() {
    setBusy(true);
    try {
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

  const inputClass = 'w-full rounded border border-ink/20 p-2';

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Review listing request</h1>

      <div className="rounded-lg border border-ink/10 bg-white p-4 text-sm">
        <p className="font-medium text-ink">Submitted by {request.user?.fullName ?? 'Unknown'}</p>
        <p className="text-ink/60">{request.user?.email}{request.user?.phone ? ` · ${request.user.phone}` : ''}</p>
        <p className="mt-2 text-ink/70">Contact phone: <span className="font-mono">{request.contactPhone ?? '—'}</span></p>
        {request.contactWhatsapp && (
          <p className="text-ink/70">WhatsApp: <span className="font-mono">{request.contactWhatsapp}</span></p>
        )}
        <p className="mt-2 text-ink/70">
          Indicative price:{' '}
          <span className="font-mono">
            {request.priceMin ? Number(request.priceMin).toLocaleString() : '—'}
            {request.priceMax ? ` – ${Number(request.priceMax).toLocaleString()} EGP` : ''}
          </span>
        </p>
        <p className="text-ink/70">Max guests: {request.maxGuests} · Region: {request.region?.replace('_', ' ')}</p>
      </div>

      <input className={inputClass} value={draft.title ?? ''}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })} />

      <textarea className={inputClass} rows={4} value={draft.description ?? ''}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })} />

      <input className={inputClass} value={draft.location ?? ''}
        onChange={(e) => setDraft({ ...draft, location: e.target.value })} />

      <div className="flex gap-3">
        {request.images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img} src={img} alt="" className="h-24 w-24 rounded object-cover" />
        ))}
      </div>

      <div className="pt-2">
        <button disabled={busy} onClick={handleApprove} className="btn-primary">
          Approve &amp; publish
        </button>
      </div>

      <div className="rounded-lg border border-ink/10 bg-white p-4">
        <textarea placeholder="Rejection reason (sent to submitter)" className={inputClass}
          value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        <button disabled={busy || !rejectReason.trim()} onClick={handleReject}
          className="btn-accent mt-2">
          Reject
        </button>
      </div>
    </div>
  );
}
