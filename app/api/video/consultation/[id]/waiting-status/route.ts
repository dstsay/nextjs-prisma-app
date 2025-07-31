import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get consultation details
    const consultation = await prisma.consultation.findFirst({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            client: true,
            artist: true,
          },
        },
      },
    });

    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // Check if user is authorized
    const userEmail = session.user?.email;
    const isClient = userEmail === consultation.appointment.client.email;
    const isArtist = userEmail === consultation.appointment.artist.email;

    if (!isClient && !isArtist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      waitingRoomStatus: consultation.waitingRoomStatus,
      sessionStartedAt: consultation.sessionStartedAt,
      twilioRoomStatus: consultation.twilioRoomStatus,
      isClientWaiting: consultation.waitingRoomStatus === 'client-waiting',
      isArtistWaiting: consultation.waitingRoomStatus === 'artist-waiting',
      sessionActive: consultation.sessionStartedAt !== null && consultation.sessionEndedAt === null,
    });
  } catch (error) {
    console.error('Waiting status error:', error);
    return NextResponse.json(
      { error: 'Failed to get waiting status' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, action } = await request.json();

    // Get consultation
    const consultation = await prisma.consultation.findFirst({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            client: true,
            artist: true,
          },
        },
      },
    });

    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // Check authorization
    const userEmail = session.user?.email;
    const isClient = userEmail === consultation.appointment.client.email;
    const isArtist = userEmail === consultation.appointment.artist.email;

    if (!isClient && !isArtist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Handle different actions
    let updateData: any = {};

    if (action === 'join-waiting') {
      if (isClient) {
        updateData.waitingRoomStatus = 'client-waiting';
      } else if (isArtist) {
        updateData.waitingRoomStatus = consultation.waitingRoomStatus === 'client-waiting' 
          ? 'client-waiting' 
          : 'artist-waiting';
      }
    } else if (action === 'leave-waiting') {
      if (isClient && consultation.waitingRoomStatus === 'client-waiting') {
        updateData.waitingRoomStatus = 'empty';
      } else if (isArtist && consultation.waitingRoomStatus === 'artist-waiting') {
        updateData.waitingRoomStatus = 'empty';
      }
    } else if (status) {
      // Direct status update (for internal use)
      updateData.waitingRoomStatus = status;
    }

    const updated = await prisma.consultation.update({
      where: { id: consultation.id },
      data: updateData,
    });

    return NextResponse.json({
      waitingRoomStatus: updated.waitingRoomStatus,
      isClientWaiting: updated.waitingRoomStatus === 'client-waiting',
    });
  } catch (error) {
    console.error('Update waiting status error:', error);
    return NextResponse.json(
      { error: 'Failed to update waiting status' },
      { status: 500 }
    );
  }
}