'use client';

import { useEffect, useState } from 'react';
import { CurrentUser, getCurrentUser, logout } from '../lib/api';

export function Header() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-ink/10 bg-sand/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="/" className="font-display text-2xl font-medium tracking-tight text-ink">
          Coastly<span className="text-marina">.</span>
        </a>

        <nav className="flex items-center gap-5 text-sm">
          {!user && (
            <>
              <a href="/login" className="text-ink/70 hover:text-ink">Log in</a>
              <a href="/register" className="text-ink/70 hover:text-ink">Sign up</a>
            </>
          )}

          {user && user.role === 'ADMIN' && (
            <>
              <a href="/listing-requests" className="text-ink/70 hover:text-ink">Listing requests</a>
              <a href="/bookings" className="text-ink/70 hover:text-ink">Bookings</a>
              <button onClick={logout} className="text-ink/70 hover:text-ink">Log out</button>
            </>
          )}

          {user && user.role !== 'ADMIN' && (
            <>
              <a href="/submit-listing" className="text-ink/70 hover:text-ink">List your chalet</a>
              <a href="/my-requests" className="text-ink/70 hover:text-ink">My requests</a>
              <button onClick={logout} className="text-ink/70 hover:text-ink">Log out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
