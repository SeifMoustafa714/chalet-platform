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
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function AdminBookingsPage() {
  const { data: bookings, isLoading, mutate } = useSWR<AdminBooking[]>('/bookings', fetcher);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

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

  async function verifyPayment(paymentId: string) {
    setBusyId(paymentId);
    try {
      await api.patch(`/payments/${paymentId}/verify`);
      mutate();
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Bookings</h1>
      <div className="space-y-3">
        {bookings?.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
        {bookings?.map((b) => (
          <div key={b.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{b.listing.title}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[b.status]}`}>{b.status}</span>
            </div>
            <p className="text-sm text-gray-500">
              {b.user.fullName} ({b.user.email}{b.user.phone ? `, ${b.user.phone}` : ''})
            </p>
            <p className="text-sm text-gray-500">
              {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()} · {b.guests} guests
            </p>

            {b.status === 'pending' && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  placeholder="Quoted price (EGP)"
                  className="w-40 rounded border p-1 text-sm"
                  onChange={(e) => setPriceDrafts({ ...priceDrafts, [b.id]: e.target.value })}
                />
                <button disabled={busyId === b.id} onClick={() => confirm(b.id)}
                  className="rounded bg-emerald-600 px-3 py-1 text-sm text-white disabled:opacity-50">
                  Confirm
                </button>
                <button disabled={busyId === b.id} onClick={() => reject(b.id)}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50">
                  Reject
                </button>
              </div>
            )}

            {b.status === 'confirmed' && !b.payment && (
              <p className="mt-2 text-sm text-gray-500">Waiting for customer to submit payment reference.</p>
            )}

            {b.payment && (
              <div className="mt-2 rounded bg-gray-50 p-2 text-sm">
                Payment: {b.payment.method} · ref {b.payment.transactionRef} · {b.payment.amount} EGP ·{' '}
                <span className="font-medium">{b.payment.status}</span>
                {b.payment.status === 'submitted' && (
                  <button disabled={busyId === b.id} onClick={() => verifyPayment(b.payment!.id)}
                    className="ml-2 rounded bg-sky-600 px-2 py-0.5 text-xs text-white">
                    Verify payment
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
