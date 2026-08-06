'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      if (redirect) {
        window.location.href = redirect;
      } else {
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
        window.location.href = payload.role === 'ADMIN' ? '/dashboard' : '/';
      }
    } catch {
      setError('Invalid email or password.');
      setPassword('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Log in</h1>

      {redirect && (
        <p className="rounded-lg bg-sun/20 p-3 text-sm text-ink/70">
          Please log in to continue booking your stay.
        </p>
      )}

      <input
        type="email"
        required
        placeholder="Email"
        className="w-full rounded border border-ink/20 p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        required
        placeholder="Password"
        className="w-full rounded border border-ink/20 p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-sm text-bougainvillea">{error}</p>}

      <button className="btn-primary w-full text-center">Log in</button>

      <p className="text-center text-sm text-ink/60">
        No account yet?{' '}
        <a href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'} className="text-marina">
          Sign up
        </a>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-ink/60">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
