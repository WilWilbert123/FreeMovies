import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies, etc.

  // getUser() ensures we actually contact the Supabase server to verify the user
  // This is what prevents deleted users from staying logged in!
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect the /watch routes from unauthenticated users
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/watch')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, but tries to visit /login, redirect to home
  if (
    user &&
    request.nextUrl.pathname === '/login'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that actually require auth checks:
     * - /watch/* (protected: must be logged in)
     * - /login   (redirect if already logged in)
     *
     * All other routes (/, /movies, /tv, /category/*, etc.) are public
     * and don't need a server round-trip to Supabase on every request.
     * This was the #1 Vercel Fluid CPU consumer.
     */
    '/watch/:path*',
    '/login',
  ],
}
