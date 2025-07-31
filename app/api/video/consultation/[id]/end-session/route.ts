import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { twilioClient } from '../../../../../../lib/twilio';
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

    const { confirmed } = await request.json();

    // Require confirmation
    if (!confirmed) {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
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

    // Check if user is authorized (either client or artist)
    const userEmail = session.user?.email;
    const isClient = userEmail === consultation.appointment.client.email;
    const isArtist = userEmail === consultation.appointment.artist.email;

    if (!isClient && !isArtist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if session is active
    if (!consultation.sessionStartedAt || consultation.sessionEndedAt) {
      return NextResponse.json({ error: 'No active session' }, { status: 400 });
    }

    // End the Twilio room
    if (consultation.twilioRoomSid) {
      try {
        await twilioClient.video.v1
          .rooms(consultation.twilioRoomSid)
          .update({ status: 'completed' });
      } catch (twilioError) {
        console.error('Failed to end Twilio room:', twilioError);
        // Continue even if Twilio fails
      }
    }

    // Update consultation
    const updated = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        sessionEndedAt: new Date(),
        endedAt: new Date(),
        twilioRoomStatus: 'completed',
        waitingRoomStatus: 'empty',
      },
    });

    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json({
      success: true,
      sessionEndedAt: updated.sessionEndedAt,
      endedBy: isArtist ? 'artist' : 'client',
      message: 'Session ended successfully',
    });
  } catch (error) {
    console.error('End session error:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}