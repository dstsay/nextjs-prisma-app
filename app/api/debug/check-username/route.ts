import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  
  // Check with exact match
  const clientExact = await prisma.client.findUnique({
    where: { username: username || '' }
  })
  const artistExact = await prisma.makeupArtist.findUnique({
    where: { username: username || '' }
  })
  
  // Check with case-insensitive search
  const clientCaseInsensitive = await prisma.client.findFirst({
    where: { 
      username: { 
        equals: username || '', 
        mode: 'insensitive' 
      } 
    }
  })
  const artistCaseInsensitive = await prisma.makeupArtist.findFirst({
    where: { 
      username: { 
        equals: username || '', 
        mode: 'insensitive' 
      } 
    }
  })
  
  // Count all users (to verify connection)
  const clientCount = await prisma.client.count()
  const artistCount = await prisma.makeupArtist.count()
  
  return NextResponse.json({
    searchedUsername: username,
    exactMatch: {
      inClient: !!clientExact,
      inArtist: !!artistExact,
      clientData: clientExact,
      artistData: artistExact
    },
    caseInsensitive: {
      inClient: !!clientCaseInsensitive,
      inArtist: !!artistCaseInsensitive,
      clientUsername: clientCaseInsensitive?.username,
      artistUsername: artistCaseInsensitive?.username
    },
    totalCounts: {
      clients: clientCount,
      artists: artistCount
    },
    databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + '...'
  })
}