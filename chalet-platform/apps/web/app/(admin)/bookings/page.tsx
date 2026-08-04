'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api, fetcher } from '../../../lib/api';

interface AdminBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  quotedPrice?: string;
  listing: { title: string };
  user: { fullName: string; email: string; phone?: string };
  payment?: { id: string; method: string; transactionRef: string; amount: string; status: string };
}

const STATUS_STYLES: Record<AdminBooking['status'], string> = {
  pending: 'bg-sun/30 text-ink',
  confirmed: 'bg-marina/20 text-marina-deep',
  rejected: 'bg-bougainvillea/15 text-bougainvillea',
  cancelled: 'bg-ink/10 text-ink/50',
};

export default function AdminBookingsPage() {
  const { data: bookings, isLoading, mutate } = useSWR<AdminBooking[]>('/bookings', fetcher);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ checkIn: string; checkOut: string; guests: number } | null>(null);

  async function confirm(id: string) {
    setBusyId(id);
    try {
      const quotedPrice = priceDrafts[id] ? Number(priceDrafts[id]) : undefined;
      await api.patch(`/bookings/${id}/confirm`, { quotedPrice });
      mutate();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    try {
      await api.patch(`/bookings/${id}/reject`, { reason: 'Not available for the requested dates' });
      mutate();
    } finally {
      setBusyId(null);
    }
  }

  async function cancelBooking(id: string) {
    if (!confirm('Cancel this booking?')) return;
    setBusyId(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      mutate();
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(b: AdminBooking) {
    setEditingId(b.id);
    setEditDraft({
      checkIn: b.checkIn.slice(0, 10),
      checkOut: b.checkOut.slice(0, 10),
      guests: b.guests,
    });
  }

  async function saveEdit(id: string) {
    if (!editDraft) return;
    setBusyId(id);
    try {
      await api.patch(`/bookings/${id}`, editDraft);
      setEditingId(null);
      mutate();
    } finally {
      setBusyId(null);
    }
  }

  async function verifyPayment(paymentId: string) {
    setBusyId(paymentId);
    try {
      await api.patch(`/payments/${paymentId}/verify`);
      mutate();
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-medium text-ink">Bookings</h1>
      <div className="space-y-3">
        {bookings?.length === 0 && <p className="text-ink/60">No bookings yet.</p>}
        {bookings?.map((b) => {
          const isConfirmedAndPaid = b.status === 'confirmed' && b.payment?.status === 'verified';
          const isEditing = editingId === b.id;
          return (
            <div key={b.id} className="rounded-lg border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-medium text-ink">{b.listing.title}</h2>
                  <p className="font-mono text-xs text-ink/40">#{b.id.slice(0, 8)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status]}`}>
                  {isConfirmedAndPaid ? 'confirmed ✓' : b.status}
                </span>
              </div>
              <p className="text-sm text-ink/60">
                {b.user.fullName} ({b.user.email}{b.user.phone ? `, ${b.user.phone}` : ''})
              </p>

              {isEditing && editDraft ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input type="date" className="rounded border border-ink/20 p-1 text-sm"
                    value={editDraft.checkIn} onChange={(e) => setEditDraft({ ...editDraft, checkIn: e.target.value })} />
                  <input type="date" className="rounded border border-ink/20 p-1 text-sm"
                    value={editDraft.checkOut} onChange={(e) => setEditDraft({ ...editDraft, checkOut: e.target.value })} />
                  <input type="number" min={1} className="w-16 rounded border border-ink/20 p-1 text-sm"
                    value={editDraft.guests} onChange={(e) => setEditDraft({ ...editDraft, guests: Number(e.target.value) })} />
                  <button disabled={busyId === b.id} onClick={() => saveEdit(b.id)}
                    className="rounded bg-marina px-2 py-1 text-xs text-white disabled:opacity-50">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-ink/50">Cancel</button>
                </div>
              ) : (
                <p className="font-mono text-sm text-ink/60">
                  {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()} · {b.guests} guests
                </p>
              )}

              {b.status === 'pending' && !isEditing && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    placeholder="Quoted price (EGP)"
                    className="w-40 rounded border border-ink/20 p-1 text-sm"
                    onChange={(e) => setPriceDrafts({ ...priceDrafts, [b.id]: e.target.value })}
                  />
                  <button disabled={busyId === b.id} onClick={() => confirm(b.id)}
                    className="rounded bg-marina px-3 py-1 text-sm text-white disabled:opacity-50">
                    Confirm
                  </button>
                  <button disabled={busyId === b.id} onClick={() => reject(b.id)}
                    className="rounded bg-bougainvillea px-3 py-1 text-sm text-white disabled:opacity-50">
                    Reject
                  </button>
                </div>
              )}

              {b.status === 'confirmed' && !b.payment && (
                <p className="mt-2 text-sm text-ink/50">
                  Quoted {b.quotedPrice ? `${Number(b.quotedPrice).toLocaleString()} EGP` : ''} · waiting for customer to pay via InstaPay.
                </p>
              )}

              {b.payment && (
                <div className="mt-2 rounded bg-sand/60 p-2 font-mono text-sm">
                  InstaPay · ref {b.payment.transactionRef} · {b.payment.amount} EGP ·{' '}
                  <span className="font-sans font-medium">{b.payment.status}</span>
                  {b.payment.status === 'submitted' && (
                    <button disabled={busyId === b.id} onClick={() => verifyPayment(b.payment!.id)}
                      className="ml-2 rounded bg-marina px-2 py-0.5 font-sans text-xs text-white">
                      Verify payment
                    </button>
                  )}
                </div>
              )}

              {isConfirmedAndPaid && (
                <p className="mt-2 rounded bg-marina/10 p-2 text-sm text-marina-deep">
                  ✓ Booking confirmed for the customer.
                </p>
              )}

              {!isEditing && b.status !== 'cancelled' && (
                <div className="mt-3 flex gap-3 text-sm">
                  <button onClick={() => startEdit(b)} className="text-marina">Edit dates/guests</button>
                  <button disabled={busyId === b.id} onClick={() => cancelBooking(b.id)} className="text-bougainvillea disabled:opacity-50">
                    Cancel booking
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
