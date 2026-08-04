'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { PriceRange } from '../../../../components/PriceRange';
import { api, fetcher, getCurrentUser, whatsappLink, Listing } from '../../../../lib/api';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data: listing, mutate } = useSWR<Listing>(`/listings/${params.id}`, fetcher);
  const [loggedIn, setLoggedIn] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(!!getCurrentUser());
  }, []);

  if (!listing) return <p className="text-ink/60">Loading…</p>;

  const whatsappUrl = whatsappLink(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
    `I have a question about ${listing.title}`,
  );
  const avgRating = listing.reviews?.length
    ? (listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null;

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/listings/${params.id}/reviews`, { rating, comment: comment || undefined });
      setComment('');
      mutate();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  const bookingUrl = `/bookings/new?listingId=${listing.id}`;
  const requestToBookHref = loggedIn ? bookingUrl : `/login?redirect=${encodeURIComponent(bookingUrl)}`;

  return (
    <article className="max-w-2xl space-y-6">
      <div>
        {listing.verifiedFlag && <span className="badge-verified">✓ Verified</span>}
        <h1 className="mt-2 font-display text-3xl font-medium text-ink">{listing.title}</h1>
        <p className="text-ink/60">{listing.location} · up to {listing.maxGuests} guests</p>
        <PriceRange pricing={listing.pricing} />
      </div>

      <p className="whitespace-pre-line text-ink/80">{listing.description}</p>

      {listing.amenities?.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-medium text-ink">Amenities</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {listing.amenities.map((a) => (
              <span key={a} className="rounded-full bg-sand px-3 py-1 text-sm text-ink/70">{a}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <a href={whatsappUrl} className="btn-accent">Ask on WhatsApp</a>
        <a href={requestToBookHref} className="btn-primary">Request to book</a>
      </div>

      <div className="border-t border-ink/10 pt-6">
        <h2 className="font-display text-lg font-medium text-ink">
          Reviews {avgRating && <span className="font-mono text-sm text-ink/50">★ {avgRating} ({listing.reviews?.length})</span>}
        </h2>

        <div className="mt-3 space-y-3">
          {(!listing.reviews || listing.reviews.length === 0) && (
            <p className="text-sm text-ink/50">No reviews yet.</p>
          )}
          {listing.reviews?.map((r) => (
            <div key={r.id} className="rounded-lg border border-ink/10 bg-white p-3 text-sm">
              <p className="font-medium text-ink">{r.user.fullName} <span className="font-mono text-ink/40">★ {r.rating}</span></p>
              {r.comment && <p className="mt-1 text-ink/70">{r.comment}</p>}
            </div>
          ))}
        </div>

        {loggedIn ? (
          <form onSubmit={submitReview} className="mt-4 space-y-2 rounded-lg border border-ink/10 bg-white p-4">
            <label className="block text-sm text-ink/70">
              Rating
              <select className="ml-2 rounded border border-ink/20 p-1" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </label>
            <textarea placeholder="Optional comment" className="w-full rounded border border-ink/20 p-2 text-sm"
              value={comment} onChange={(e) => setComment(e.target.value)} />
            {error && <p className="text-sm text-bougainvillea">{error}</p>}
            <button disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Submitting…' : 'Leave a review'}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-ink/50"><a href="/login" className="text-marina">Log in</a> to leave a review.</p>
        )}
      </div>
    </article>
  );
}
