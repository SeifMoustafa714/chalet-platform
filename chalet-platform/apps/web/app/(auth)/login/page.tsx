'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      router.push('/');
    } catch {
      setError('Invalid email or password.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Log in</h1>
      <input type="email" required placeholder="Email" className="w-full rounded border p-2"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" required placeholder="Password" className="w-full rounded border p-2"
        value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="w-full rounded-lg bg-sky-600 px-4 py-2 text-white">Log in</button>
    </form>
  );
}
