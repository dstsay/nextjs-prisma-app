import { LoginForm } from "@/components/auth/LoginForm"
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons"
import Link from "next/link"

export default function ClientLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4">
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Home
          </Link>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <div className="mt-4 bg-white py-6 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm userType="client" />

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <SocialLoginButtons userType="client" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-center text-sm">
              <span className="text-gray-600">Are you a makeup artist? </span>
              <Link href="/auth/artist/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}