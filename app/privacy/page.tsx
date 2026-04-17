import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Trip Planner',
  description: 'How Trip Planner handles your personal data',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to home
      </Link>

      <h1 className="text-2xl font-semibold mt-6 mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold mb-2">1. About this project</h2>
          <p>
            Trip Planner is a portfolio project built by Nattapong Sindhu to demonstrate full-stack
            development skills. It is not a commercial service and is not intended for storing sensitive
            or real travel data. By using this application you acknowledge that this is a demonstration
            environment.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Data we collect</h2>
          <p>When you sign in via magic link, we collect:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your email address (used for authentication only)</li>
            <li>Session cookies required to keep you signed in</li>
            <li>Any trip data you voluntarily enter (titles, dates, notes, budget items)</li>
          </ul>
          <p className="mt-2">
            We do not collect analytics, track your location, or use third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. How data is stored</h2>
          <p>
            All data is stored in a Supabase PostgreSQL database hosted in the United States.
            Authentication is handled by Supabase Auth. Database access is protected by Row Level
            Security policies enforced at the database layer.
          </p>
          <p className="mt-2">
            Passwords are never stored — sign-in uses time-limited magic links sent to your email.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Visibility of your trips</h2>
          <p>
            Each trip has an <code className="bg-muted px-1 rounded">is_public</code> flag. Trips you
            create are <strong>private by default</strong> and only visible to authenticated users.
            You may choose to mark a trip as public, in which case it becomes viewable by anyone with
            the URL.
          </p>
          <p className="mt-2">
            Do not store real travel dates, accommodation addresses, or flight details in public trips
            — this could create personal security risks.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Your rights</h2>
          <p>You can at any time:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Delete any trip you created via the edit page</li>
            <li>Sign out to end your session</li>
            <li>Request account and data deletion by emailing the address below</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Data retention</h2>
          <p>
            Trip data is retained indefinitely until you delete it. Email addresses associated with
            inactive accounts may be removed after 12 months of no sign-in activity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Third-party services</h2>
          <p>This application uses:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Vercel</strong> — hosting and edge network</li>
            <li><strong>Supabase</strong> — database and authentication</li>
          </ul>
          <p className="mt-2">
            These services have their own privacy policies. See
            {' '}<a href="https://vercel.com/legal/privacy-policy" className="underline" target="_blank" rel="noopener noreferrer">Vercel Privacy</a>
            {' '}and{' '}
            <a href="https://supabase.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Supabase Privacy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
          <p>
            Questions about this policy or requests for data deletion: <strong>nattapongsindhu@gmail.com</strong>
          </p>
          <p className="mt-2">
            To report a security issue, see{' '}
            <a
              href="https://github.com/nattapongsindhu/Trip-Planner/blob/main/SECURITY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              SECURITY.md
            </a>.
          </p>
        </section>

      </div>
    </main>
  )
}
