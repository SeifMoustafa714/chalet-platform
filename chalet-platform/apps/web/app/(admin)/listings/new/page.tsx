'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, AMENITIES, Region } from '../../../../lib/api';

const REGIONS: Region[] = ['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm'];

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', location: '', region: REGIONS[0],
    maxGuests: 4, basePrice: '', weekendPrice: '', contactPhone: '',
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleAmenity(a: string) {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  function addImage() {
    if (imageInput.trim()) {
      setImages((prev) => [...prev, imageInput.trim()]);
      setImageInput('');
    }
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

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
        images,
        amenities,
        contactPhone: form.contactPhone || undefined,
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

      <input required placeholder="Contact phone (internal reference only)" className={inputClass}
        value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />

      <div className="flex gap-4">
        <input required placeholder="Base price (EGP)" className={inputClass}
          value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
        <input placeholder="Weekend price (EGP, optional)" className={inputClass}
          value={form.weekendPrice} onChange={(e) => setForm({ ...form, weekendPrice: e.target.value })} />
      </div>

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
        <p className="text-sm text-ink/60">Add one or more direct image links.</p>
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
        {submitting ? 'Publishing…' : 'Publish listing'}
      </button>
    </form>
  );
}
