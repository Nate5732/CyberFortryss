import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('🔍 Middleware hit:', req.nextUrl.pathname)
  
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('🔐 Session exists:', !!session)
  if (session) {
    console.log('👤 Session user ID:', session.user.id)
  }

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      console.log('❌ No session - redirecting to login')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check if user is admin or super_admin
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    console.log('👤 User role:', user?.role)
    console.log('❓ Query error:', error)

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      console.log('❌ Not admin - redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    console.log('✅ Admin access granted')
  }

  // Protect /dashboard route
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      console.log('❌ No session for dashboard - redirecting to login')
      return NextResponse.redirect(new URL('/login', req.url))
    }
    console.log('✅ Dashboard access granted')
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}