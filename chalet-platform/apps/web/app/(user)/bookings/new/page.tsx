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
        (Array.isArray(msg) ? msg.join(' · ') : msg) ??
          'Could not submit booking request. Make sure you are logged in.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!listingId) {
    return <p className="text-bougainvillea">No listing selected. Please go back and click "Request to book" from a listing page.</p>;
  }

  if (done) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-2xl font-medium text-ink">Request sent</h1>
        <p className="text-ink/70">
          Your booking request has been submitted as <strong>pending</strong>. Our team will confirm
          availability and pricing with the host, then reach out. You can track it under "My requests."
        </p>
        <a href="/" className="inline-block text-marina">← Back to listings</a>
      </div>
    );
  }

  const inputClass = 'mt-1 w-full rounded border border-ink/20 p-2';

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Request to book</h1>
      <p className="text-sm text-ink/60">
        This sends a request only — nothing is charged yet. Final price and availability are confirmed
        manually before payment.
      </p>

      <label className="block text-sm text-ink/70">Check-in
        <input required type="date" className={inputClass}
          value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
      </label>

      <label className="block text-sm text-ink/70">Check-out
        <input required type="date" className={inputClass}
          value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
      </label>

      <label className="block text-sm text-ink/70">Guests
        <input required type="number" min={1} className={inputClass}
          value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
      </label>

      {error && <p className="text-sm text-bougainvillea">{error}</p>}

      <button disabled={submitting} className="btn-primary w-full text-center">
        {submitting ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<p className="text-ink/60">Loading…</p>}>
      <NewBookingForm />
    </Suspense>
  );
}
