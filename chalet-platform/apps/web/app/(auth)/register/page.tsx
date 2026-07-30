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
      setError(err?.response?.data?.message ?? 'Could not create account. Try a different email.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Create an account</h1>

      <input required placeholder="Full name" className="w-full rounded border p-2"
        value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />

      <input required type="email" placeholder="Email" className="w-full rounded border p-2"
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

      <input placeholder="Phone (optional)" className="w-full rounded border p-2"
        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

      <input required type="password" placeholder="Password (min 8 characters)" className="w-full rounded border p-2"
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={submitting} className="w-full rounded-lg bg-sky-600 px-4 py-2 text-white disabled:opacity-50">
        {submitting ? 'Creating account…' : 'Sign up'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account? <a href="/login" className="text-sky-600">Log in</a>
      </p>
    </form>
  );
}
