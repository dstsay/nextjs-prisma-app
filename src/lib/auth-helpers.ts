import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export type UserType = "client" | "artist"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth(userType?: UserType) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }
  
  if (userType && user.userType !== userType) {
    redirect("/auth/unauthorized")
  }
  
  return user
}

export async function requireClientAuth() {
  return requireAuth("client")
}

export async function requireArtistAuth() {
  return requireAuth("artist")
}

export function getLoginUrl(userType: UserType) {
  return userType === "artist" ? "/auth/artist/login" : "/auth/client/login"
}

export function getDashboardUrl(userType: UserType) {
  return userType === "artist" ? "/artist/dashboard" : "/client/dashboard"
}

export function isValidUserType(userType: string): userType is UserType {
  return userType === "client" || userType === "artist"
}