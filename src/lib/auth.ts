import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

// Custom Prisma adapter to handle separate Client and MakeupArtist models
const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data: any) => {
    // Determine user type based on the sign-in flow
    const userType = data.userType || "client"
    
    if (userType === "artist") {
      return prisma.makeupArtist.create({
        data: {
          email: data.email,
          name: data.name || "",
          username: data.email.split("@")[0],
          emailVerified: data.emailVerified,
          profileImage: data.image,
        },
      })
    } else {
      return prisma.client.create({
        data: {
          email: data.email,
          name: data.name,
          username: data.email.split("@")[0],
          emailVerified: data.emailVerified,
          profileImage: data.image,
        },
      })
    }
  },
  getUser: async (id: string) => {
    // Try to find in both Client and MakeupArtist tables
    const client = await prisma.client.findUnique({ where: { id } })
    if (client) {
      return { ...client, userType: "client" }
    }
    
    const artist = await prisma.makeupArtist.findUnique({ where: { id } })
    if (artist) {
      return { ...artist, userType: "artist" }
    }
    
    return null
  },
  getUserByEmail: async (email: string) => {
    const client = await prisma.client.findUnique({ where: { email } })
    if (client) {
      return { ...client, userType: "client" }
    }
    
    const artist = await prisma.makeupArtist.findUnique({ where: { email } })
    if (artist) {
      return { ...artist, userType: "artist" }
    }
    
    return null
  },
  getUserByAccount: async ({ providerAccountId, provider }: any) => {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true },
    })
    if (account) {
      return { ...account.user, userType: "client" }
    }
    
    const artistAccount = await prisma.artistAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { artist: true },
    })
    if (artistAccount) {
      return { ...artistAccount.artist, userType: "artist" }
    }
    
    return null
  },
  updateUser: async ({ id, ...data }: any) => {
    // Try to update in both tables
    const client = await prisma.client.findUnique({ where: { id } })
    if (client) {
      return prisma.client.update({ where: { id }, data })
    }
    
    const artist = await prisma.makeupArtist.findUnique({ where: { id } })
    if (artist) {
      return prisma.makeupArtist.update({ where: { id }, data })
    }
    
    throw new Error("User not found")
  },
  linkAccount: async (data: any) => {
    const { userId, ...accountData } = data
    
    // Check if it's a client or artist
    const client = await prisma.client.findUnique({ where: { id: userId } })
    if (client) {
      return prisma.account.create({
        data: { ...accountData, userId },
      })
    }
    
    const artist = await prisma.makeupArtist.findUnique({ where: { id: userId } })
    if (artist) {
      return prisma.artistAccount.create({
        data: { ...accountData, artistId: userId },
      })
    }
    
    throw new Error("User not found")
  },
  createSession: async ({ sessionToken, userId, expires }: any) => {
    const client = await prisma.client.findUnique({ where: { id: userId } })
    if (client) {
      return prisma.session.create({
        data: { sessionToken, userId, expires },
      })
    }
    
    const artist = await prisma.makeupArtist.findUnique({ where: { id: userId } })
    if (artist) {
      return prisma.artistSession.create({
        data: { sessionToken, artistId: userId, expires },
      })
    }
    
    throw new Error("User not found")
  },
  getSessionAndUser: async (sessionToken: string) => {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })
    if (session) {
      return {
        session,
        user: { ...session.user, userType: "client" },
      }
    }
    
    const artistSession = await prisma.artistSession.findUnique({
      where: { sessionToken },
      include: { artist: true },
    })
    if (artistSession) {
      return {
        session: artistSession,
        user: { ...artistSession.artist, userType: "artist" },
      }
    }
    
    return null
  },
  updateSession: async (data: any) => {
    const { sessionToken } = data
    
    const session = await prisma.session.findUnique({ where: { sessionToken } })
    if (session) {
      return prisma.session.update({ where: { sessionToken }, data })
    }
    
    const artistSession = await prisma.artistSession.findUnique({ where: { sessionToken } })
    if (artistSession) {
      return prisma.artistSession.update({ where: { sessionToken }, data })
    }
    
    return null
  },
  deleteSession: async (sessionToken: string) => {
    try {
      await prisma.session.delete({ where: { sessionToken } })
    } catch {
      try {
        await prisma.artistSession.delete({ where: { sessionToken } })
      } catch {
        // Session not found
      }
    }
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Temporarily disable custom adapter to use JWT-only authentication
  // The custom adapter was causing issues with session establishment
  // adapter: customPrismaAdapter as any,
  ...authConfig,
})

