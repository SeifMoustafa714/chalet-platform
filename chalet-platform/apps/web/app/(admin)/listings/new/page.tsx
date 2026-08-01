'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Region } from '../../../../lib/api';

const REGIONS: Region[] = ['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm'];

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', location: '', region: REGIONS[0],
    maxGuests: 4, basePrice: '', weekendPrice: '', imageUrl: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/listings', {
        title: form.title,
        description: form.description,
        location: form.location,
        region: form.region,
        maxGuests: Number(form.maxGuests),
        images: [form.imageUrl],
        basePrice: Number(form.basePrice),
        weekendPrice: form.weekendPrice ? Number(form.weekendPrice) : undefined,
      });
      router.push('/listings');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Could not create listing.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full rounded border border-ink/20 p-2';

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Add a listing</h1>
      <p className="text-sm text-ink/60">
        This publishes immediately — no review step, since you're the admin.
      </p>

      <input required placeholder="Title" className={inputClass}
        value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

      <textarea required placeholder="Description" rows={4} className={inputClass}
        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <input required placeholder="Location" className={inputClass}
        value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

      <select className={inputClass} value={form.region}
        onChange={(e) => setForm({ ...form, region: e.target.value as Region })}>
        {REGIONS.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
      </select>

      <input required type="number" placeholder="Max guests" className={inputClass}
        value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })} />

      <div className="flex gap-4">
        <input required placeholder="Base price (EGP)" className={inputClass}
          value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
        <input placeholder="Weekend price (EGP, optional)" className={inputClass}
          value={form.weekendPrice} onChange={(e) => setForm({ ...form, weekendPrice: e.target.value })} />
      </div>

      <input required placeholder="Image URL (direct link)" className={inputClass}
        value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />

      {error && <p className="text-sm text-bougainvillea">{error}</p>}

      <button disabled={submitting} className="btn-primary">
        {submitting ? 'Publishing…' : 'Publish listing'}
      </button>
    </form>
  );
}
