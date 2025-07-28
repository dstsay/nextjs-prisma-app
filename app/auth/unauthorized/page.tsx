import Link from "next/link"
import { auth } from "@/lib/auth"

export default async function UnauthorizedPage() {
  const session = await auth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 mb-8">
            You don&apos;t have permission to access this page.
          </p>
          
          {session ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                You are logged in as a {session.user.userType}.
              </p>
              <Link
                href={session.user.userType === "artist" ? "/artist/dashboard" : "/client/dashboard"}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                href="/auth/client/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Client Login
              </Link>
              <Link
                href="/auth/artist/login"
                className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Artist Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}