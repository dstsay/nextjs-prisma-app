"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserType } from "@/lib/auth-helpers"

interface LoginFormProps {
  userType: UserType
}

function LoginFormInner({ userType }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || `/${userType}/dashboard`
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    console.log(`[LoginForm ${new Date().toISOString()}] Starting login for ${userType}`)
    console.log(`[LoginForm] Username: ${formData.username}`)
    console.log(`[LoginForm] CallbackUrl: ${callbackUrl}`)

    try {
      const result = await signIn(
        userType === "artist" ? "artist-credentials" : "client-credentials",
        {
          username: formData.username,
          password: formData.password,
          redirect: false,
        }
      )

      console.log(`[LoginForm ${new Date().toISOString()}] SignIn result:`, result)

      if (result?.error) {
        console.log(`[LoginForm] Login failed with error: ${result.error}`)
        setError("Invalid username or password")
      } else if (result?.ok) {
        console.log(`[LoginForm ${new Date().toISOString()}] Login successful, waiting 100ms...`)
        
        // Add a small delay to ensure session is established
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log(`[LoginForm ${new Date().toISOString()}] Attempting redirect to: ${callbackUrl}`)
        
        // Use callbackUrl or default to dashboard
        router.push(callbackUrl)
        router.refresh()
        
        console.log(`[LoginForm ${new Date().toISOString()}] Redirect initiated`)
      }
    } catch (error) {
      console.error(`[LoginForm ${new Date().toISOString()}] Unexpected error:`, error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  )
}

// Export wrapper component with Suspense boundary
export function LoginForm(props: LoginFormProps) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
      </div>
    }>
      <LoginFormInner {...props} />
    </Suspense>
  )
}