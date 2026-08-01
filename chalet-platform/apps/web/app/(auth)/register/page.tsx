'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('accessToken', data.accessToken);
      router.push('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Could not create account. Try a different email.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Create an account</h1>

      <input required placeholder="Full name" className="w-full rounded border border-ink/20 p-2"
        value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />

      <input required type="email" placeholder="Email" className="w-full rounded border border-ink/20 p-2"
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

      <input placeholder="Phone (optional)" className="w-full rounded border border-ink/20 p-2"
        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

      <input required type="password" placeholder="Password (min 8 characters)" className="w-full rounded border border-ink/20 p-2"
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

      {error && <p className="text-sm text-bougainvillea">{error}</p>}

      <button disabled={submitting} className="btn-primary w-full text-center">
        {submitting ? 'Creating account…' : 'Sign up'}
      </button>

      <p className="text-center text-sm text-ink/60">
        Already have an account? <a href="/login" className="text-marina">Log in</a>
      </p>
    </form>
  );
}
