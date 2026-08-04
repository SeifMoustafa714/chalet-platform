'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { api, fetcher } from '../../../../lib/api';
import { MonthCalendar } from '../../../../components/MonthCalendar';

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId') ?? '';

  const { data: availability } = useSWR<{ date: string; isBlocked: boolean }[]>(
    listingId ? `/listings/${listingId}/availability` : null,
    fetcher,
  );
  const blockedDates = new Set((availability ?? []).map((a) => a.date.slice(0, 10)));

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function handleDayClick(date: string) {
    setError(null);
    if (!checkIn || checkOut) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }
    if (date <= checkIn) {
      setCheckIn(date);
      return;
    }
    const range = dateRange(checkIn, date);
    const hasBlocked = range.some((d) => blockedDates.has(d));
    if (hasBlocked) {
      setError('Your stay would overlap an unavailable date — pick a shorter range.');
      setCheckIn(date);
      setCheckOut(null);
      return;
    }
    setCheckOut(date);
  }

  const selectedDates = checkIn && checkOut ? new Set(dateRange(checkIn, checkOut)) : checkIn ? new Set([checkIn]) : new Set<string>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError('Select both a check-in and check-out date on the calendar.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/bookings', { listingId, checkIn, checkOut, guests: Number(guests) });
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
          availability and pricing with the host, then reach out. You can track it under "My bookings."
        </p>
        <a href="/" className="inline-block text-marina">← Back to listings</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Request to book</h1>
      <p className="text-sm text-ink/60">
        Tap a date to set check-in, then tap another to set check-out. Greyed-out dates are already booked.
      </p>

      <MonthCalendar
        blockedDates={blockedDates}
        selectedDates={selectedDates}
        onDayClick={handleDayClick}
        disableBlockedDates
      />

      <div className="rounded-lg border border-ink/10 bg-white p-3 font-mono text-sm text-ink/70">
        Check-in: {checkIn ?? '—'} · Check-out: {checkOut ?? '—'}
      </div>

      <label className="block text-sm text-ink/70">Guests
        <input required type="number" min={1} className="mt-1 w-full rounded border border-ink/20 p-2"
          value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
      </label>

      {error && <p className="text-sm text-bougainvillea">{error}</p>}

      <button disabled={submitting || !checkIn || !checkOut} className="btn-primary w-full text-center disabled:opacity-50">
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
