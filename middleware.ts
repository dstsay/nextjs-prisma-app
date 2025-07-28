import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// Wrap the middleware with auth
export default auth((request) => {
  const pathname = request.nextUrl.pathname
  const session = request.auth
  
  console.log(`[Middleware ${new Date().toISOString()}] Running for path: ${pathname}`)
  console.log(`[Middleware] Session found: ${!!session}`)
  if (session?.user) {
    console.log(`[Middleware] Session userType: ${session.user.userType}, id: ${session.user.id}`)
  }
  
  // Routes that require authentication
  const protectedRoutes = {
    client: ["/client/dashboard"],
    artist: ["/artist/dashboard"],
  }

  // Routes that should redirect authenticated users
  const authRoutes = [
    "/auth/client/login",
    "/auth/artist/login",
    "/auth/signin",
  ]
  
  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Check if the route is protected
  const isClientRoute = protectedRoutes.client.some(route => pathname.startsWith(route))
  const isArtistRoute = protectedRoutes.artist.some(route => pathname.startsWith(route))
  const isProtectedRoute = isClientRoute || isArtistRoute
  
  console.log(`[Middleware] Route type - Auth: ${isAuthRoute}, Protected: ${isProtectedRoute}, Client: ${isClientRoute}, Artist: ${isArtistRoute}`)
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    const dashboardUrl = session.user.userType === "artist" 
      ? "/artist/dashboard" 
      : "/client/dashboard"
    console.log(`[Middleware] Redirecting authenticated user from auth page to: ${dashboardUrl}`)
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }
  
  // Protect routes that require authentication
  if (isProtectedRoute && !session) {
    const loginUrl = isArtistRoute 
      ? "/auth/artist/login" 
      : "/auth/client/login"
    const redirectUrl = new URL(loginUrl, request.url)
    redirectUrl.searchParams.set("callbackUrl", pathname)
    console.log(`[Middleware] Redirecting unauthenticated user to: ${redirectUrl.toString()}`)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Check role-based access
  if (session?.user) {
    if (isClientRoute && session.user.userType !== "client") {
      console.log(`[Middleware] Unauthorized: Client route accessed by ${session.user.userType}`)
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url))
    }
    if (isArtistRoute && session.user.userType !== "artist") {
      console.log(`[Middleware] Unauthorized: Artist route accessed by ${session.user.userType}`)
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url))
    }
  }
  
  console.log(`[Middleware] Allowing request to proceed`)
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/client/:path*",
    "/artist/:path*",
    "/auth/:path*",
  ],
}