'use client';

import useSWR from 'swr';
import { fetcher } from '../../../lib/api';

export default function AdminDashboardPage() {
  const { data: pendingRequests } = useSWR('/listing-requests?status=pending_review', fetcher);
  const { data: allListings } = useSWR('/listings/admin/all', fetcher);
  const { data: pendingBookings } = useSWR('/bookings?status=pending', fetcher);
  const { data: allBookings } = useSWR('/bookings', fetcher);

  const liveListingsCount = allListings?.filter((l: any) => l.isActive).length ?? 0;
  const paymentsToVerify = allBookings?.filter((b: any) => b.payment?.status === 'submitted').length ?? 0;

  const cards = [
    {
      label: 'Pending listing requests',
      value: pendingRequests?.length,
      href: '/listing-requests',
      accent: 'bg-sun/30',
    },
    {
      label: 'Live listings',
      value: liveListingsCount,
      href: '/listings',
      accent: 'bg-marina/20',
    },
    {
      label: 'Pending bookings',
      value: pendingBookings?.length,
      href: '/bookings',
      accent: 'bg-sun/30',
    },
    {
      label: 'Payments to verify',
      value: paymentsToVerify,
      href: '/bookings',
      accent: 'bg-bougainvillea/15',
    },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-medium text-ink">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          
            key={c.label}
            href={c.href}
            className="block rounded-xl border border-ink/10 bg-white p-5 transition hover:shadow-md"
          >
            <div className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-ink ${c.accent}`}>
              {c.label}
            </div>
            <p className="mt-3 font-display text-3xl font-medium text-ink">
              {c.value === undefined ? '—' : c.value}
            </p>
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-lg font-medium text-ink">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a href="/listings/new" className="btn-primary">+ Add listing</a>
          <a href="/listing-requests" className="rounded-lg border border-ink/20 px-4 py-2 text-ink/70 hover:text-ink">Review requests</a>
          <a href="/bookings" className="rounded-lg border border-ink/20 px-4 py-2 text-ink/70 hover:text-ink">Manage bookings</a>
        </div>
      </div>
    </div>
  );
}
