export default function AboutPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-medium text-ink">About Coastly</h1>

      <p className="text-ink/80">
        Coastly is a marketplace for booking vacation chalets across Egypt's coast — the North Coast,
        Ain Sokhna, Marsa Matrouh, and Sharm El Sheikh. We built it because finding a trustworthy chalet
        for a weekend often means digging through Facebook groups and broker WhatsApp chains with no way
        to verify who you're actually dealing with.
      </p>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">How we review listings</h2>
        <p className="mt-2 text-ink/80">
          Every chalet on this site — whether submitted by a broker, an owner, or added directly by our
          team — goes through the same review step before it's visible to anyone. We check the details,
          the photos, and the price range before approving it. Listings are never published automatically.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">How booking and payment work</h2>
        <p className="mt-2 text-ink/80">
          A booking request doesn't charge you anything. Once you send one, we confirm availability and
          the final price directly with the host, then get back to you. Only after that's confirmed do
          you pay — via InstaPay — and only once we've verified the payment is your booking finalized.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">Get in touch</h2>
        <p className="mt-2 text-ink/80">
          Questions about a listing, a booking, or anything else — reach us on WhatsApp using the button
          on any listing page, or from the contact link in the footer.
        </p>
      </div>
    </div>
  );
}
