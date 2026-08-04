'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CurrentUser, getCurrentUser, logout } from '../lib/api';

const ADMIN_LINKS = [
  { href: '/listing-requests', label: 'Listing requests' },
  { href: '/listings', label: 'Listings' },
  { href: '/bookings', label: 'Bookings' },
];

const USER_LINKS = [
  { href: '/submit-listing', label: 'List your chalet' },
  { href: '/my-requests', label: 'My requests' },
  { href: '/my-bookings', label: 'My bookings' },
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  const links = user?.role === 'ADMIN' ? ADMIN_LINKS : USER_LINKS;

  return (
    <header className="sticky top-0 z-10 border-b border-ink/10 bg-sand/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="/" className="font-display text-2xl font-medium tracking-tight text-ink">
          Coastly<span className="text-marina">.</span>
        </a>

        {!isAuthPage && (
          <nav className="flex items-center gap-4 text-sm">
            {!user && (
              <>
                <a href="/login" className="text-ink/70 hover:text-ink">Log in</a>
                <a href="/register" className="text-ink/70 hover:text-ink">Sign up</a>
              </>
            )}

            {user && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-1 text-ink/70 hover:text-ink"
                  >
                    Menu <span className="text-xs">▾</span>
                  </button>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-ink/10 bg-white py-1 shadow-lg">
                        {links.map((l) => (
                          
                            key={l.href}
                            href={l.href}
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-ink/70 hover:bg-sand hover:text-ink"
                          >
                            {l.label}
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <button onClick={logout} className="text-ink/70 hover:text-ink">Log out</button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
