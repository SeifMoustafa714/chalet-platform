export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-display text-xl font-medium text-ink">
              Coastly<span className="text-marina">.</span>
            </p>
            <p className="mt-1 max-w-xs text-sm text-ink/60">
              Verified chalets across Egypt's coast — every listing reviewed before it goes live.
            </p>
          </div>

          <div className="text-sm text-ink/60">
            <p className="mb-2 font-medium text-ink/80">Regions</p>
            <ul className="space-y-1">
              <li>North Coast</li>
              <li>Ain Sokhna</li>
              <li>Marsa Matrouh</li>
              <li>Sharm El Sheikh</li>
            </ul>
          </div>

          <div className="text-sm text-ink/60">
            <p className="mb-2 font-medium text-ink/80">Coastly</p>
            <ul className="space-y-1">
              <li><a href="/login" className="hover:text-ink">Log in</a></li>
              <li><a href="/register" className="hover:text-ink">Sign up</a></li>
              <li><a href="/submit-listing" className="hover:text-ink">List your chalet</a></li>
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t border-ink/10 pt-4 text-xs text-ink/40">
          © {new Date().getFullYear()} Coastly. All listings are reviewed by our team before publishing.
        </p>
      </div>
    </footer>
  );
}
