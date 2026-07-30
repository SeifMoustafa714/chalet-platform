import './globals.css';

export const metadata = {
  title: 'Sahel — Chalets on Egypt\'s Coast',
  description: 'Verified chalets across the North Coast, Ain Sokhna, Marsa Matrouh and Sharm El Sheikh.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-ink/10 bg-sand/95 backdrop-blur px-6 py-4 sticky top-0 z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <a href="/" className="font-display text-2xl font-medium tracking-tight text-ink">
              Sahel<span className="text-marina">.</span>
            </a>
            <nav className="flex items-center gap-5 text-sm">
              <a href="/submit-listing" className="text-ink/70 hover:text-ink">List your chalet</a>
              <a href="/my-requests" className="text-ink/70 hover:text-ink">My requests</a>
              <a href="/login" className="text-ink/70 hover:text-ink">Log in</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
