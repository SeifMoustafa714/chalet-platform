'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api, fetcher } from '../../../../lib/api';

interface BookingDetail {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  quotedPrice?: string;
  adminNotes?: string;
  listing: { title: string; location: string };
  payment?: { transactionRef: string; amount: string; status: string };
}

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const { data: booking, isLoading, mutate } = useSWR<BookingDetail>(`/bookings/${params.id}`, fetcher);
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({ checkIn: '', checkOut: '', guests: 1 });
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  if (isLoading) return <p className="text-ink/60">Loading…</p>;
  if (!booking) return <p className="text-bougainvillea">Booking not found.</p>;

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/bookings/${params.id}/payment`, {
        method: 'instapay',
        transactionRef,
        amount: Number(booking!.quotedPrice),
      });
      mutate();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Could not submit payment.');
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing() {
    setEditDraft({
      checkIn: booking!.checkIn.slice(0, 10),
      checkOut: booking!.checkOut.slice(0, 10),
      guests: booking!.guests,
    });
    setEditing(true);
  }

  async function saveEdit() {
    setSavingEdit(true);
    setEditError(null);
    try {
      await api.patch(`/bookings/${params.id}`, editDraft);
      setEditing(false);
      mutate();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setEditError(Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Could not save changes.');
    } finally {
      setSavingEdit(false);
    }
  }

  const isConfirmedAndPaid = booking.status === 'confirmed' && booking.payment?.status === 'verified';

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <p className="font-mono text-xs text-ink/40">Booking #{booking.id.slice(0, 8)}</p>
        <h1 className="font-display text-2xl font-medium text-ink">{booking.listing.title}</h1>
        <p className="text-sm text-ink/60">{booking.listing.location}</p>
      </div>

      <div className="rounded-lg border border-ink/10 bg-white p-4">
        {editing ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="date" className="rounded border border-ink/20 p-1 text-sm"
                value={editDraft.checkIn} onChange={(e) => setEditDraft({ ...editDraft, checkIn: e.target.value })} />
              <input type="date" className="rounded border border-ink/20 p-1 text-sm"
                value={editDraft.checkOut} onChange={(e) => setEditDraft({ ...editDraft, checkOut: e.target.value })} />
              <input type="number" min={1} className="w-16 rounded border border-ink/20 p-1 text-sm"
                value={editDraft.guests} onChange={(e) => setEditDraft({ ...editDraft, guests: Number(e.target.value) })} />
            </div>
            {editError && <p className="text-sm text-bougainvillea">{editError}</p>}
            <div className="flex gap-3 text-sm">
              <button disabled={savingEdit} onClick={saveEdit} className="rounded bg-marina px-3 py-1 text-white disabled:opacity-50">
                {savingEdit ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="text-ink/50">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="font-mono text-sm">
            <p>{new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}</p>
            <p>{booking.guests} guests</p>
            {booking.status === 'pending' && (
              <button onClick={startEditing} className="mt-2 font-sans text-sm text-marina">Edit dates/guests</button>
            )}
          </div>
        )}
      </div>

      {isConfirmedAndPaid && (
        <div className="rounded-lg border-2 border-marina bg-marina/10 p-5 text-center">
          <p className="text-3xl">✓</p>
          <h2 className="mt-1 font-display text-xl font-medium text-ink">Booking confirmed</h2>
          <p className="mt-1 text-sm text-ink/70">
            Reference <span className="font-mono">{booking.id.slice(0, 8)}</span> · {Number(booking.payment!.amount).toLocaleString()} EGP paid
          </p>
        </div>
      )}

      {booking.status === 'pending' && (
        <p className="rounded-lg bg-sun/20 p-4 text-sm text-ink/70">
          Your request is pending — we're confirming availability and price with the host. You can still edit your dates or guest count above.
        </p>
      )}

      {booking.status === 'rejected' && (
        <p className="rounded-lg bg-bougainvillea/10 p-4 text-sm text-bougainvillea">
          This booking wasn't available.{booking.adminNotes ? ` ${booking.adminNotes}` : ''}
        </p>
      )}

      {booking.status === 'confirmed' && !isConfirmedAndPaid && !booking.payment && (
        <div className="rounded-lg border border-ink/10 bg-white p-4 space-y-3">
          <p className="text-ink/70">
            Confirmed! Final price:{' '}
            <span className="font-mono text-lg text-ink">{Number(booking.quotedPrice).toLocaleString()} EGP</span>
          </p>
          <form onSubmit={submitPayment} className="space-y-3">
            <p className="text-sm text-ink/60">Pay via InstaPay, then enter your transaction reference below.</p>
            <input
              required
              placeholder="InstaPay transaction reference"
              className="w-full rounded border border-ink/20 p-2"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
            {error && <p className="text-sm text-bougainvillea">{error}</p>}
            <button disabled={submitting} className="btn-primary w-full text-center">
              {submitting ? 'Submitting…' : 'Submit payment reference'}
            </button>
          </form>
        </div>
      )}

      {booking.payment && booking.payment.status === 'submitted' && (
        <p className="rounded-lg bg-sun/20 p-4 text-sm text-bougainvillea">
          Payment reference received — waiting for admin to verify it.
        </p>
      )}
    </div>
  );
}
