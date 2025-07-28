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
  
  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Check if the route is protected
  const isClientRoute = protectedRoutes.client.some(route => pathname.startsWith(route))
  const isArtistRoute = protectedRoutes.artist.some(route => pathname.startsWith(route))
  const isProtectedRoute = isClientRoute || isArtistRoute
  
  // Get the token using getToken which works in Edge Runtime
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  })
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    const dashboardUrl = token.userType === "artist" 
      ? "/artist/dashboard" 
      : "/client/dashboard"
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }
  
  // Protect routes that require authentication
  if (isProtectedRoute && !token) {
    const loginUrl = isArtistRoute 
      ? "/auth/artist/login" 
      : "/auth/client/login"
    const redirectUrl = new URL(loginUrl, request.url)
    redirectUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Check role-based access
  if (token) {
    if (isClientRoute && token.userType !== "client") {
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url))
    }
    if (isArtistRoute && token.userType !== "artist") {
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/client/:path*",
    "/artist/:path*",
    "/auth/:path*",
  ],
}