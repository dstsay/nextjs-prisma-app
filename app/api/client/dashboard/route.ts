import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the client
    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client profile not found' },
        { status: 404 }
      );
    }

    // Get all appointments for the client
    const appointments = await prisma.appointment.findMany({
      where: { clientId: client.id },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        consultation: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    // Calculate statistics
    const now = new Date();
    const completedConsultations = appointments.filter(
      apt => apt.status === 'COMPLETED' && apt.type === 'CONSULTATION'
    ).length;

    const upcomingAppointments = appointments.filter(
      apt => 
        (apt.status === 'CONFIRMED' || apt.status === 'PENDING') &&
        apt.scheduledAt > now
    ).length;

    return NextResponse.json({
      appointments: appointments.map(apt => ({
        id: apt.id,
        scheduledAt: apt.scheduledAt.toISOString(),
        status: apt.status,
        type: apt.type,
        duration: apt.duration,
        artist: apt.artist,
        consultation: apt.consultation,
      })),
      completedConsultations,
      upcomingAppointments,
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}