import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Trip Planner',
  description: 'Terms for using Trip Planner',
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to home
      </Link>

      <h1 className="text-2xl font-semibold mt-6 mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold mb-2">1. Acceptance of terms</h2>
          <p>
            By accessing or using Trip Planner, you agree to be bound by these Terms of Service. If
            you do not agree, do not use this application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Nature of this service</h2>
          <p>
            Trip Planner is a <strong>portfolio demonstration project</strong>, not a commercial
            service. It is provided free of charge to showcase the developer&apos;s skills. It should
            not be used for:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Storing real travel plans, flight details, or accommodation bookings</li>
            <li>Storing personal information of third parties</li>
            <li>Any mission-critical use case</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. No warranty</h2>
          <p>
            This application is provided <strong>&quot;as is&quot;</strong> without warranty of any
            kind. The developer makes no guarantees about availability, data durability, or fitness
            for any particular purpose.
          </p>
          <p className="mt-2">
            Data may be lost at any time due to database pauses (Supabase free tier), service
            outages, code updates, or other reasons. Do not rely on this application as a primary
            record of any information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Attempt to bypass authentication or Row Level Security</li>
            <li>Upload malicious content or attempt denial-of-service attacks</li>
            <li>Store illegal content or content that infringes on others&apos; rights</li>
            <li>Abuse the service in a way that impacts its availability for other users</li>
            <li>Scrape data at a rate that exceeds reasonable use</li>
          </ul>
          <p className="mt-2">
            Responsible security research is encouraged — see{' '}
            <a
              href="https://github.com/nattapongsindhu/Trip-Planner/blob/main/SECURITY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              SECURITY.md
            </a>{' '}
            for our vulnerability disclosure policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Your content</h2>
          <p>
            You retain ownership of any trip data you create. By marking a trip as public, you grant
            other users permission to view that content.
          </p>
          <p className="mt-2">
            The developer reserves the right to remove content that violates these terms without
            notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Account termination</h2>
          <p>
            Your account may be terminated at any time, with or without notice, if you violate these
            terms. You may request account deletion by contacting the developer.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the developer shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your use
            of this application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Changes to terms</h2>
          <p>
            These terms may be updated from time to time. Continued use of the application after
            changes constitutes acceptance of the new terms. The &quot;Last updated&quot; date at
            the top of this page reflects the most recent revision.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. Contact</h2>
          <p>
            Questions about these terms: <strong>nattapongsindhu@gmail.com</strong>
          </p>
        </section>

      </div>
    </main>
  )
}
