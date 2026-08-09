'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api, fetcher } from '../../../../lib/api';

interface AdminBookingDetail {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  quotedPrice?: string;
  adminNotes?: string;
  listing: { title: string; location: string };
  user: { fullName: string; email: string; phone?: string };
  payment?: { id: string; method: string; transactionRef: string; amount: string; status: string };
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-sun/30 text-ink',
  confirmed: 'bg-marina/20 text-marina-deep',
  rejected: 'bg-bougainvillea/15 text-bougainvillea',
  cancelled: 'bg-ink/10 text-ink/50',
};

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: booking, mutate } = useSWR<AdminBookingDetail>(`/bookings/${params.id}`, fetcher);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [busy, setBusy] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({ checkIn: '', checkOut: '', guests: 1 });

  if (!booking) return <p className="text-ink/60">Loading…</p>;

  const isConfirmedAndPaid = booking.status === 'confirmed' && booking.payment?.status === 'verified';

  async function confirm() {
    setBusy(true);
    try {
      await api.patch(`/bookings/${params.id}/confirm`, { quotedPrice: quotedPrice ? Number(quotedPrice) : undefined });
      mutate();
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true);
    try {
      await api.patch(`/bookings/${params.id}/reject`, { reason: 'Not available for the requested dates' });
      mutate();
    } finally {
      setBusy(false);
    }
  }

  async function cancelBooking() {
    if (!confirm('Cancel this booking?')) return;
    setBusy(true);
    try {
      await api.patch(`/bookings/${params.id}/cancel`);
      mutate();
    } finally {
      setBusy(false);
    }
  }

  function startEdit() {
    setEditDraft({
      checkIn: booking!.checkIn.slice(0, 10),
      checkOut: booking!.checkOut.slice(0, 10),
      guests: booking!.guests,
    });
    setEditing(true);
  }

  async function saveEdit() {
    setBusy(true);
    try {
      await api.patch(`/bookings/${params.id}`, editDraft);
      setEditing(false);
      mutate();
    } finally {
      setBusy(false);
    }
  }

  async function verifyPayment() {
    if (!booking.payment) return;
    setBusy(true);
    try {
      await api.patch(`/payments/${booking.payment.id}/verify`);
      mutate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-5">
      <button onClick={() => router.push('/bookings')} className="text-sm text-marina">← Back to bookings</button>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-ink/40">Booking #{booking.id.slice(0, 8)}</p>
          <h1 className="font-display text-2xl font-medium text-ink">{booking.listing.title}</h1>
          <p className="text-sm text-ink/60">{booking.listing.location}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
          {isConfirmedAndPaid ? 'confirmed ✓' : booking.status}
        </span>
      </div>

      <div className="rounded-lg border border-ink/10 bg-white p-4">
        <p className="font-medium text-ink">{booking.user.fullName}</p>
        <p className="text-sm text-ink/60">{booking.user.email}{booking.user.phone ? ` · ${booking.user.phone}` : ''}</p>
      </div>

      <div className="rounded-lg border border-ink/10 bg-white p-4">
        {editing ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <input type="date" className="rounded border border-ink/20 p-1 text-sm"
                value={editDraft.checkIn} onChange={(e) => setEditDraft({ ...editDraft, checkIn: e.target.value })} />
              <input type="date" className="rounded border border-ink/20 p-1 text-sm"
                value={editDraft.checkOut} onChange={(e) => setEditDraft({ ...editDraft, checkOut: e.target.value })} />
              <input type="number" min={1} className="w-16 rounded border border-ink/20 p-1 text-sm"
                value={editDraft.guests} onChange={(e) => setEditDraft({ ...editDraft, guests: Number(e.target.value) })} />
            </div>
            <div className="flex gap-3 text-sm">
              <button disabled={busy} onClick={saveEdit} className="rounded bg-marina px-3 py-1 text-white disabled:opacity-50">Save</button>
              <button onClick={() => setEditing(false)} className="text-ink/50">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="font-mono text-sm">
            <p>{new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}</p>
            <p>{booking.guests} guests</p>
            {booking.status !== 'cancelled' && (
              <button onClick={startEdit} className="mt-2 font-sans text-sm text-marina">Edit dates/guests</button>
            )}
          </div>
        )}
      </div>

      {booking.status === 'pending' && (
        <div className="rounded-lg border border-ink/10 bg-white p-4">
          <label className="block text-sm text-ink/70">
            Quoted price (EGP)
            <input className="mt-1 w-full rounded border border-ink/20 p-2"
              value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} />
          </label>
          <div className="mt-3 flex gap-3">
            <button disabled={busy} onClick={confirm} className="btn-primary">Confirm</button>
            <button disabled={busy} onClick={reject} className="btn-accent">Reject</button>
          </div>
        </div>
      )}

      {booking.status === 'confirmed' && !booking.payment && (
        <p className="rounded-lg bg-sun/20 p-4 text-sm text-ink/70">
          Quoted {booking.quotedPrice ? `${Number(booking.quotedPrice).toLocaleString()} EGP` : ''} · waiting for the customer to pay via InstaPay.
        </p>
      )}

      {booking.payment && (
        <div className="rounded-lg bg-sand/60 p-4 font-mono text-sm">
          InstaPay · ref {booking.payment.transactionRef} · {booking.payment.amount} EGP ·{' '}
          <span className="font-sans font-medium">{booking.payment.status}</span>
          {booking.payment.status === 'submitted' && (
            <button disabled={busy} onClick={verifyPayment} className="ml-2 rounded bg-marina px-2 py-0.5 font-sans text-xs text-white">
              Verify payment
            </button>
          )}
        </div>
      )}

      {isConfirmedAndPaid && (
        <p className="rounded-lg bg-marina/10 p-3 text-sm text-marina-deep">✓ Booking confirmed for the customer.</p>
      )}

      {booking.status !== 'cancelled' && !editing && (
        <button disabled={busy} onClick={cancelBooking} className="text-sm text-bougainvillea disabled:opacity-50">
          Cancel booking
        </button>
      )}
    </div>
  );
}
