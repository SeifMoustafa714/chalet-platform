export default function TermsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-medium text-ink">Terms of Service</h1>
      <p className="text-sm text-ink/50">Last updated: {new Date().toLocaleDateString()}</p>

      <p className="rounded-lg bg-sun/20 p-4 text-sm text-ink/70">
        This is a general-purpose template, not legal advice. Before relying on this for real bookings
        and payments, it should be reviewed by a lawyer familiar with Egyptian consumer and e-commerce law.
      </p>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">1. What Coastly is</h2>
        <p className="mt-2 text-ink/80">
          Coastly is a marketplace connecting people looking to book vacation chalets with brokers and
          owners offering them, across the North Coast, Ain Sokhna, Marsa Matrouh, and Sharm El Sheikh.
          Coastly is not the owner or manager of any chalet listed on the site.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">2. Listings and moderation</h2>
        <p className="mt-2 text-ink/80">
          Every listing is reviewed by our team before it becomes publicly visible. Approval indicates
          the listing was checked for completeness and reasonableness — it is not a guarantee of the
          property's condition, accuracy of every detail, or the host's conduct.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">3. Bookings and pricing</h2>
        <p className="mt-2 text-ink/80">
          Prices shown are indicative. Submitting a booking request does not charge you and does not
          guarantee availability. A booking is only confirmed once our team verifies availability and a
          final price with the host, and you complete payment via InstaPay, which we then verify.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">4. Accounts</h2>
        <p className="mt-2 text-ink/80">
          You're responsible for keeping your account credentials secure and for the accuracy of the
          information you provide, including your email (verified by a one-time code) and contact details.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">5. Reviews</h2>
        <p className="mt-2 text-ink/80">
          Reviews may only be left by guests with a confirmed booking for that listing, and should
          reflect a genuine, honest experience. We reserve the right to remove reviews that violate this.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">6. Limitation of liability</h2>
        <p className="mt-2 text-ink/80">
          Coastly facilitates the connection and booking process but is not a party to the rental
          agreement between guest and host. Disputes about the property itself, its condition, or
          conduct during a stay are between the guest and host.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">7. Changes</h2>
        <p className="mt-2 text-ink/80">
          These terms may be updated from time to time. Continued use of the site after a change means
          you accept the updated terms.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">8. Contact</h2>
        <p className="mt-2 text-ink/80">
          Questions about these terms — reach us via the WhatsApp button on any listing page.
        </p>
      </div>
    </div>
  );
}
