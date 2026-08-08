'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const redirect = searchParams.get('redirect');

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/verify-email', { email, code });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      if (redirect) {
        window.location.href = redirect;
      } else {
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
        window.location.href = payload.role === 'ADMIN' ? '/dashboard' : '/';
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendMessage(null);
    setError(null);
    try {
      await api.post('/auth/resend-otp', { email, purpose: 'verify' });
      setResendMessage('A new code has been sent to your email.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not send the code. Please try again in a moment.');
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Verify your email</h1>
      <p className="text-sm text-ink/60">
        We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>. Enter it below.
      </p>

      <input
        required
        placeholder="6-digit code"
        maxLength={6}
        className="w-full rounded border border-ink/20 p-2 text-center font-mono text-lg tracking-widest"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
      />

      {error && <p className="text-sm text-bougainvillea">{error}</p>}
      {resendMessage && <p className="text-sm text-marina">{resendMessage}</p>}

      <button disabled={submitting || code.length !== 6} className="btn-primary w-full text-center disabled:opacity-50">
        {submitting ? 'Verifying…' : 'Verify'}
      </button>

      <button type="button" disabled={resending} onClick={handleResend} className="w-full text-center text-sm text-marina disabled:opacity-50">
        {resending ? 'Sending…' : "Didn't get a code? Resend"}
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-ink/60">Loading…</p>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
