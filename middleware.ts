import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Define which paths are protected
const adminPaths = [
  "/admin",
  "/admin/dashboard",
  "/admin/users",
  "/admin/events",
  "/admin/trips",
  "/admin/interviews",
  "/admin/payments",
  "/admin/messages",
  "/admin/content",
  "/admin/settings",
  "/admin/media",
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for setup page and API routes
  if (path === "/admin/setup" || path.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check if the path is an admin path
  const isAdminPath = adminPaths.some((prefix) => path.startsWith(prefix))

  if (isAdminPath) {
    console.log("Middleware running for path:", path)

    // Get the token from the cookies or Authorization header
    const cookieToken = request.cookies.get("authToken")?.value
    const headerToken = request.headers.get("Authorization")?.replace("Bearer ", "")

    const token = cookieToken || headerToken

    console.log("Token from cookies:", token ? "Found" : "Not found")

    // If there's no token, redirect to login
    if (!token) {
      console.log("No auth token found, redirecting to login")
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, request.url))
    }

    try {
      // Verify the token
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "your-secret-key")

      // Use try/catch for token verification
      try {
        const { payload } = await jwtVerify(token, secret)
        console.log("Token verified, payload:", payload)

        // Check if the user has admin role
        if (payload.role !== "admin" && payload.role !== "super_admin") {
          console.log("User does not have admin role, redirecting to login")
          const response = NextResponse.redirect(new URL("/login?error=AccessDenied", request.url))
          return response
        }

        // User is authenticated and has admin role, allow access
        console.log("User is authenticated and has admin role, allowing access")
        return NextResponse.next()
      } catch (verifyError) {
        console.error("Token verification failed:", verifyError)

        // Clear the invalid cookies
        const response = NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, request.url))
        response.cookies.set({
          name: "authToken",
          value: "",
          path: "/",
          expires: new Date(0),
        })

        return response
      }
    } catch (error) {
      console.error("Middleware error:", error)

      // Clear the invalid cookies
      const response = NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, request.url))
      response.cookies.set({
        name: "authToken",
        value: "",
        path: "/",
        expires: new Date(0),
      })

      return response
    }
  }

  // For non-admin paths, just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
