'use client';

import useSWR from 'swr';
import { api, fetcher } from '../../../../../lib/api';
import { MonthCalendar } from '../../../../../components/MonthCalendar';

interface AvailabilityDay {
  date: string;
  isBlocked: boolean;
}

export default function ListingAvailabilityPage({ params }: { params: { id: string } }) {
  const { data: availability, mutate } = useSWR<AvailabilityDay[]>(
    `/listings/${params.id}/availability`,
    fetcher,
  );

  if (!availability) return <p className="text-ink/60">Loading…</p>;

  const blockedDates = new Set(availability.filter((a) => a.isBlocked).map((a) => a.date.slice(0, 10)));

  async function toggleDay(date: string) {
    const isCurrentlyBlocked = blockedDates.has(date);
    mutate(
      [...availability.filter((a) => a.date.slice(0, 10) !== date), { date, isBlocked: !isCurrentlyBlocked }],
      false,
    );
    await api.patch(`/listings/${params.id}/availability`, { date, isBlocked: !isCurrentlyBlocked });
    mutate();
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Manage availability</h1>
      <p className="text-sm text-ink/60">Click a date to toggle it blocked/available.</p>
      <MonthCalendar blockedDates={blockedDates} onDayClick={toggleDay} />
    </div>
  );
}
