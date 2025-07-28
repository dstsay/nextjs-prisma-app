import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID!,
      clientSecret: process.env.AUTH_APPLE_SECRET!,
      authorization: {
        params: {
          scope: "name email",
          response_mode: "form_post",
        },
      },
    }),
    Credentials({
      id: "client-credentials",
      name: "Client Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const client = await prisma.client.findUnique({
          where: { username: credentials.username as string },
        })

        if (!client || !client.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          client.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: client.id,
          email: client.email,
          name: client.name,
          image: client.profileImage,
          userType: "client",
        }
      },
    }),
    Credentials({
      id: "artist-credentials",
      name: "Artist Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const artist = await prisma.makeupArtist.findUnique({
          where: { username: credentials.username as string },
        })

        if (!artist || !artist.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          artist.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: artist.id,
          email: artist.email,
          name: artist.name,
          image: artist.profileImage,
          userType: "artist",
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.userType = user.userType
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.userType = token.userType as "client" | "artist"
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig