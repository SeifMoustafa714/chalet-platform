'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/auth/register', form);
      const verifyUrl = `/verify-email?email=${encodeURIComponent(form.email)}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;
      window.location.href = verifyUrl;
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Could not create account. Try a different email.');
      setForm({ ...form, password: '' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Create an account</h1>

      {redirect && (
        <p className="rounded-lg bg-sun/20 p-3 text-sm text-ink/70">
          Please sign up to continue booking your stay.
        </p>
      )}

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
        Already have an account?{' '}
        <a href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} className="text-marina">
          Log in
        </a>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="text-ink/60">Loading…</p>}>
      <RegisterForm />
    </Suspense>
  );
}
