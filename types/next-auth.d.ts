import "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userType: "client" | "artist"
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    userType: "client" | "artist"
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    userType: string
  }
}