import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    // Member routes
    if (pathname.startsWith('/member') && token?.role !== 'MEMBER') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    // Shop routes
    if (pathname.startsWith('/shop') && token?.role !== 'SHOP') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        // Protected paths require a token
        if (
          pathname.startsWith('/admin') ||
          pathname.startsWith('/member') ||
          pathname.startsWith('/shop')
        ) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/member/:path*', '/shop/:path*'],
}
