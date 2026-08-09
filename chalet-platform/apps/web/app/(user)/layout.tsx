'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../lib/api';

export default function UserAreaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      const target = window.location.pathname + window.location.search;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return <p className="text-ink/60">Loading…</p>;

  return <>{children}</>;
}
