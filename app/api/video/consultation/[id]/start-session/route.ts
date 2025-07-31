import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get consultation
    const consultation = await prisma.consultation.findFirst({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            artist: true,
            client: true,
          },
        },
      },
    });

    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // Only artists can start sessions
    const userEmail = session.user?.email;
    const isArtist = userEmail === consultation.appointment.artist.email;

    if (!isArtist) {
      return NextResponse.json({ error: 'Only artists can start sessions' }, { status: 403 });
    }

    // Check if client is waiting
    if (consultation.waitingRoomStatus !== 'client-waiting') {
      return NextResponse.json({ error: 'Client is not in waiting room' }, { status: 400 });
    }

    // Check if session already started
    if (consultation.sessionStartedAt) {
      return NextResponse.json({ error: 'Session already started' }, { status: 400 });
    }

    // Start the session
    const updated = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        sessionStartedAt: new Date(),
        twilioRoomStatus: 'in-progress',
        startedAt: new Date(), // Also update the general startedAt field
      },
    });

    // Update appointment status to IN_PROGRESS
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'IN_PROGRESS' },
    });

    return NextResponse.json({
      success: true,
      sessionStartedAt: updated.sessionStartedAt,
      message: 'Session started successfully',
    });
  } catch (error) {
    console.error('Start session error:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}