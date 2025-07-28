"use client"

import { signIn } from "next-auth/react"
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa"
import { useState } from "react"
import { UserType } from "@/lib/auth-helpers"

interface SocialLoginButtonsProps {
  userType: UserType
  callbackUrl?: string
}

export function SocialLoginButtons({ userType, callbackUrl }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider)
    try {
      await signIn(provider, {
        callbackUrl: callbackUrl || `/${userType}/dashboard`,
        redirect: true,
      })
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => handleSocialLogin("google")}
        disabled={isLoading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaGoogle className="text-xl" />
        <span>Continue with Google</span>
        {isLoading === "google" && (
          <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
        )}
      </button>

      <button
        onClick={() => handleSocialLogin("facebook")}
        disabled={isLoading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaFacebook className="text-xl text-blue-600" />
        <span>Continue with Facebook</span>
        {isLoading === "facebook" && (
          <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
        )}
      </button>

      <button
        onClick={() => handleSocialLogin("apple")}
        disabled={isLoading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaApple className="text-xl" />
        <span>Continue with Apple</span>
        {isLoading === "apple" && (
          <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
      </button>
    </div>
  )
}