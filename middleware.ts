import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Keep middleware side-effect free so stale auth cookies do not break public routes.
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
