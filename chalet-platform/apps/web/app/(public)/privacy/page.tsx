export default function PrivacyPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-medium text-ink">Privacy Policy</h1>
      <p className="text-sm text-ink/50">Last updated: {new Date().toLocaleDateString()}</p>

      <p className="rounded-lg bg-sun/20 p-4 text-sm text-ink/70">
        This is a general-purpose template, not legal advice. Before relying on this for real bookings
        and payments, it should be reviewed by a lawyer familiar with Egyptian data protection law.
      </p>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">What we collect</h2>
        <p className="mt-2 text-ink/80">
          When you create an account: your name, email address, phone number (optional), and a securely
          hashed password (we never store your actual password). When you submit a listing or booking:
          the details you provide, including contact information for coordinating with hosts.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">How we use it</h2>
        <p className="mt-2 text-ink/80">
          To operate the marketplace: verifying your email via a one-time code, reviewing listing
          submissions, coordinating bookings between guests and hosts, and confirming payments. We don't
          sell your data or use it for advertising.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">Who we share it with</h2>
        <p className="mt-2 text-ink/80">
          Your email is passed to our email delivery provider (Brevo) solely to send verification codes
          and account-related emails. Your booking contact details are shared with the relevant host only
          when needed to coordinate a confirmed stay. We use Railway and Vercel to host the site and
          database — standard infrastructure providers, not third parties we share data with for their
          own use.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">What we store in your browser</h2>
        <p className="mt-2 text-ink/80">
          A login session token is stored in your browser's local storage so you stay signed in. This
          token is cleared when you log out.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">Your rights</h2>
        <p className="mt-2 text-ink/80">
          You can ask us to delete your account and associated personal data at any time by reaching out
          via the WhatsApp button on any listing page. Some records (like completed bookings) may be kept
          for accounting purposes as required by law.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-medium text-ink">Contact</h2>
        <p className="mt-2 text-ink/80">
          Questions about this policy — reach us via the WhatsApp button on any listing page.
        </p>
      </div>
    </div>
  );
}
