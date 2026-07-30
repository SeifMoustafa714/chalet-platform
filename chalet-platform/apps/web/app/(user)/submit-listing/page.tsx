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
      setError(err?.response?.data?.message ?? 'Failed to submit. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Submit a chalet for review</h1>
      <p className="text-sm text-gray-500">
        Your listing will be reviewed by our team before it goes live. This usually takes 24–48 hours.
      </p>

      <input required placeholder="Title" className="w-full rounded border p-2"
        value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

      <textarea required placeholder="Description" rows={4} className="w-full rounded border p-2"
        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <input required placeholder="Location (e.g. Marassi, North Coast)" className="w-full rounded border p-2"
        value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

      <select className="w-full rounded border p-2" value={form.region}
        onChange={(e) => setForm({ ...form, region: e.target.value as Region })}>
        {REGIONS.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
      </select>

      <div className="flex gap-4">
        <input type="number" placeholder="Max guests" className="w-full rounded border p-2"
          value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })} />
        <input placeholder="Min price (EGP)" className="w-full rounded border p-2"
          value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} />
        <input placeholder="Max price (EGP)" className="w-full rounded border p-2"
          value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} />
      </div>

      <input required placeholder="Contact phone" className="w-full rounded border p-2"
        value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />

      {/* Image upload: request a presigned URL, PUT the file, then push the public URL into `images` */}
      <p className="text-sm text-gray-500">Add at least one image URL (upload flow wired via /uploads/presign).</p>
      <input placeholder="Paste image URL for now" className="w-full rounded border p-2"
        onBlur={(e) => e.target.value && setImages([e.target.value])} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={submitting} className="rounded-lg bg-sky-600 px-4 py-2 text-white disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Submit for review'}
      </button>
    </form>
  );
}
