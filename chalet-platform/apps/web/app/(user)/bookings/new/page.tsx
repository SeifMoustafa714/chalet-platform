'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../../lib/api';

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId') ?? '';

  const [form, setForm] = useState({ checkIn: '', checkOut: '', guests: 2 });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/bookings', {
        listingId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
      });
      setDone(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(
        (Array.isArray(msg) ? msg.join(', ') : msg) ??
          'Could not submit booking request. Make sure you are logged in.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!listingId) {
    return <p className="text-red-600">No listing selected. Please go back and click "Request to book" from a listing page.</p>;
  }

  if (done) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Request sent</h1>
        <p className="text-gray-600">
          Your booking request has been submitted as <strong>pending</strong>. Our team will confirm
          availability and pricing with the host, then reach out. You can track it under "My Bookings."
        </p>
        <a href="/" className="inline-block text-sky-600">← Back to listings</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Request to book</h1>
      <p className="text-sm text-gray-500">
        This sends a request only — nothing is charged yet. Final price and availability are confirmed
        manually before payment.
      </p>

      <label className="block text-sm">Check-in
        <input required type="date" className="mt-1 w-full rounded border p-2"
          value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
      </label>

      <label className="block text-sm">Check-out
        <input required type="date" className="mt-1 w-full rounded border p-2"
          value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
      </label>

      <label className="block text-sm">Guests
        <input required type="number" min={1} className="mt-1 w-full rounded border p-2"
          value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={submitting} className="w-full rounded-lg bg-sky-600 px-4 py-2 text-white disabled:opacity-50">
        {submitting ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <NewBookingForm />
    </Suspense>
  );
}
