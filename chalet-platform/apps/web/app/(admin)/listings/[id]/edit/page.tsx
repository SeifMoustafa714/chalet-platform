'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api, fetcher, Region } from '../../../../../lib/api';

const REGIONS: Region[] = ['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm'];

interface AdminListingDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  region: Region;
  maxGuests: number;
  images: string[];
  pricing?: { basePrice: string; weekendPrice?: string };
}

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: listing } = useSWR<AdminListingDetail>(`/listings/${params.id}/admin`, fetcher);
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title,
        description: listing.description,
        location: listing.location,
        region: listing.region,
        maxGuests: listing.maxGuests,
        basePrice: listing.pricing?.basePrice ?? '',
        weekendPrice: listing.pricing?.weekendPrice ?? '',
        imageUrl: listing.images[0] ?? '',
      });
    }
  }, [listing]);

  if (!form) return <p className="text-ink/60">Loading…</p>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.patch(`/listings/${params.id}`, {
        title: form.title,
        description: form.description,
        location: form.location,
        region: form.region,
        maxGuests: Number(form.maxGuests),
        images: form.imageUrl ? [form.imageUrl] : undefined,
        basePrice: form.basePrice ? Number(form.basePrice) : undefined,
        weekendPrice: form.weekendPrice ? Number(form.weekendPrice) : undefined,
      });
      router.push('/listings');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Could not save changes.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full rounded border border-ink/20 p-2';

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Edit listing</h1>

      <input required className={inputClass} value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })} />

      <textarea required rows={4} className={inputClass} value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <input required className={inputClass} value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })} />

      <select className={inputClass} value={form.region}
        onChange={(e) => setForm({ ...form, region: e.target.value as Region })}>
        {REGIONS.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
      </select>

      <input required type="number" className={inputClass} value={form.maxGuests}
        onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })} />

      <div className="flex gap-4">
        <input placeholder="Base price" className={inputClass} value={form.basePrice}
          onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
        <input placeholder="Weekend price" className={inputClass} value={form.weekendPrice}
          onChange={(e) => setForm({ ...form, weekendPrice: e.target.value })} />
      </div>

      <input className={inputClass} value={form.imageUrl}
        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />

      {error && <p className="text-sm text-bougainvillea">{error}</p>}

      <button disabled={submitting} className="btn-primary">
        {submitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
