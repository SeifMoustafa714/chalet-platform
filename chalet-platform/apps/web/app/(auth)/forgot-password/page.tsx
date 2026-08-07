'use client';

import { useState } from 'react';
import { api } from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('reset');
    } catch {
      setStep('reset');
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm space-y-4 text-center">
        <h1 className="font-display text-2xl font-medium text-ink">Password updated</h1>
        <p className="text-ink/70">You can now log in with your new password.</p>
        <a href="/login" className="btn-primary inline-block">Go to login</a>
      </div>
    );
  }

  if (step === 'email') {
    return (
      <form onSubmit={requestCode} className="mx-auto max-w-sm space-y-4">
        <h1 className="font-display text-2xl font-medium text-ink">Forgot your password?</h1>
        <p className="text-sm text-ink/60">Enter your email and we'll send you a reset code.</p>
        <input
          required
          type="email"
          placeholder="Email"
          className="w-full rounded border border-ink/20 p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button disabled={submitting} className="btn-primary w-full text-center">
          {submitting ? 'Sending…' : 'Send reset code'}
        </button>
        <p className="text-center text-sm text-ink/60">
          <a href="/login" className="text-marina">Back to login</a>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={resetPassword} className="mx-auto max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-medium text-ink">Enter your reset code</h1>
      <p className="text-sm text-ink/60">
        If an account exists for <span className="font-medium text-ink">{email}</span>, a code was sent to it.
      </p>

      <input
        required
        placeholder="6-digit code"
        maxLength={6}
        className="w-full rounded border border-ink/20 p-2 text-center font-mono text-lg tracking-widest"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
      />

      <input
        required
        type="password"
        placeholder="New password (min 8 characters)"
        className="w-full rounded border border-ink/20 p-2"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      {error && <p className="text-sm text-bougainvillea">{error}</p>}

      <button disabled={submitting || code.length !== 6} className="btn-primary w-full text-center disabled:opacity-50">
        {submitting ? 'Resetting…' : 'Reset password'}
      </button>
    </form>
  );
}
