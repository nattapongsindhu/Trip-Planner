import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-24 text-center">
      <p className="text-4xl font-semibold mb-3">404</p>
      <p className="text-muted-foreground mb-6">Trip not found.</p>
      <Link
        href="/"
        className="text-sm underline underline-offset-4 hover:text-primary transition-colors"
      >
        Back to all trips
      </Link>
    </main>
  )
}
