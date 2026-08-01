'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Region } from '../../../lib/api';

const REGIONS: Region[] = ['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm'];

export default function SubmitListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', location: '', region: REGIONS[0],
    maxGuests: 4, priceMin: '', priceMax: '', contactPhone: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/listing-requests', {
        ...form,
        maxGuests: Number(form.maxGuests),
        priceMin: form.priceMin ? Number(form.priceMin) : undefined,
        priceMax: form.priceMax ? Number(form.priceMax) : undefined,
        images,
        amenities: [],
      });
      router.push('/my-requests');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Failed to submit. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full rounded border border-ink/20 p-2';

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Submit a chalet for review</h1>
      <p className="text-sm text-ink/60">
        Your listing will be reviewed by our team before it goes live. This usually takes 24–48 hours.
      </p>

      <input required placeholder="Title" className={inputClass}
        value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

      <textarea required placeholder="Description" rows={4} className={inputClass}
        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <input required placeholder="Location (e.g. Marassi, North Coast)" className={inputClass}
        value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

      <select className={inputClass} value={form.region}
        onChange={(e) => setForm({ ...form, region: e.target.value as Region })}>
        {REGIONS.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
      </select>

      <div className="flex gap-4">
        <input type="number" placeholder="Max guests" className={inputClass}
          value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })} />
        <input placeholder="Min price (EGP)" className={inputClass}
          value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} />
        <input placeholder="Max price (EGP)" className={inputClass}
          value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} />
      </div>

      <input required placeholder="Contact phone" className={inputClass}
        value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />

      <div className="rounded-lg border border-dashed border-ink/20 bg-white p-4">
        <p className="text-sm text-ink/60">
          Paste a direct image link (ending in .jpg/.png) — copy it from the actual photo, not a search results page.
        </p>
        <input placeholder="Image URL" className={`${inputClass} mt-2`}
          onBlur={(e) => e.target.value && setImages([e.target.value])} />
      </div>

      {error && <p className="text-sm text-bougainvillea">{error}</p>}

      <button disabled={submitting} className="btn-primary">
        {submitting ? 'Submitting…' : 'Submit for review'}
      </button>
    </form>
  );
}
