'use client';

import { useState } from 'react';
import { api } from '../../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      window.location.href = '/';
    } catch {
      setError('Invalid email or password.');
      setPassword('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Log in</h1>

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
        No account yet? <a href="/register" className="text-marina">Sign up</a>
      </p>
    </form>
  );
}
