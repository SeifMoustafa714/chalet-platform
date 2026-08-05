'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, AMENITIES, Region } from '../../../lib/api';

const REGIONS: Region[] = ['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm'];

export default function SubmitListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', location: '', region: REGIONS[0],
    maxGuests: 4, priceMin: '', priceMax: '', contactPhone: '',
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addImage() {
    if (imageInput.trim()) {
      setImages((prev) => [...prev, imageInput.trim()]);
      setImageInput('');
    }
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function toggleAmenity(a: string) {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

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
        amenities,
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

      <div>
        <p className="mb-2 text-sm text-ink/70">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`rounded-full px-3 py-1 text-sm ${
                amenities.includes(a) ? 'bg-marina text-white' : 'bg-sand text-ink/70'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-ink/20 bg-white p-4">
        <p className="text-sm text-ink/60">
          Add one or more direct image links (ending in .jpg/.png) — copy from the actual photo, not a search results page.
        </p>
        <div className="mt-2 flex gap-2">
          <input placeholder="Image URL" className={inputClass}
            value={imageInput} onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }} />
          <button type="button" onClick={addImage} className="btn-primary whitespace-nowrap">Add</button>
        </div>
        {images.length > 0 && (
          <ul className="mt-3 space-y-1">
            {images.map((img, i) => (
              <li key={i} className="flex items-center justify-between text-sm text-ink/60">
                <span className="truncate">{img}</span>
                <button type="button" onClick={() => removeImage(i)} className="ml-2 text-bougainvillea">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-bougainvillea">{error}</p>}

      <button disabled={submitting} className="btn-primary">
        {submitting ? 'Submitting…' : 'Submit for review'}
      </button>
    </form>
  );
}
