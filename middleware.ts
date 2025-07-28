import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

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

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  console.log(`[Middleware ${new Date().toISOString()}] Running for path: ${pathname}`)
  
  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Check if the route is protected
  const isClientRoute = protectedRoutes.client.some(route => pathname.startsWith(route))
  const isArtistRoute = protectedRoutes.artist.some(route => pathname.startsWith(route))
  const isProtectedRoute = isClientRoute || isArtistRoute
  
  console.log(`[Middleware] Route type - Auth: ${isAuthRoute}, Protected: ${isProtectedRoute}, Client: ${isClientRoute}, Artist: ${isArtistRoute}`)
  
  // Get the token using getToken which works in Edge Runtime
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  })
  
  console.log(`[Middleware ${new Date().toISOString()}] Token found: ${!!token}`)
  if (token) {
    console.log(`[Middleware] Token userType: ${token.userType}, id: ${token.id}`)
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    const dashboardUrl = token.userType === "artist" 
      ? "/artist/dashboard" 
      : "/client/dashboard"
    console.log(`[Middleware] Redirecting authenticated user from auth page to: ${dashboardUrl}`)
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }
  
  // Protect routes that require authentication
  if (isProtectedRoute && !token) {
    const loginUrl = isArtistRoute 
      ? "/auth/artist/login" 
      : "/auth/client/login"
    const redirectUrl = new URL(loginUrl, request.url)
    redirectUrl.searchParams.set("callbackUrl", pathname)
    console.log(`[Middleware] Redirecting unauthenticated user to: ${redirectUrl.toString()}`)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Check role-based access
  if (token) {
    if (isClientRoute && token.userType !== "client") {
      console.log(`[Middleware] Unauthorized: Client route accessed by ${token.userType}`)
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url))
    }
    if (isArtistRoute && token.userType !== "artist") {
      console.log(`[Middleware] Unauthorized: Artist route accessed by ${token.userType}`)
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url))
    }
  }
  
  console.log(`[Middleware] Allowing request to proceed`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/client/:path*",
    "/artist/:path*",
    "/auth/:path*",
  ],
}