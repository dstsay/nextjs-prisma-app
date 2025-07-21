import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get database statistics
    const [clientCount, artistCount, appointmentCount] = await Promise.all([
      prisma.client.count(),
      prisma.makeupArtist.count(),
      prisma.appointment.count(),
    ]);

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      stats: {
        clients: clientCount,
        artists: artistCount,
        appointments: appointmentCount,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}