import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { twilioConfig } from '../../../../../../lib/twilio';
import { auth } from '@/lib/auth';
import { jwt } from 'twilio';
import { addMinutes, subMinutes, isWithinInterval } from 'date-fns';

const { AccessToken } = jwt;
const { VideoGrant } = AccessToken;

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

    // Get appointment and consultation details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        consultation: true,
        client: true,
        artist: true,
      },
    });

    if (!appointment || !appointment.consultation) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'Appointment not confirmed' }, { status: 400 });
    }

    // Check if user is authorized (either the client or artist)
    const userEmail = session.user?.email;
    const isClient = userEmail === appointment.client.email;
    const isArtist = userEmail === appointment.artist.email;

    if (!isClient && !isArtist) {
      return NextResponse.json({ error: 'Unauthorized for this appointment' }, { status: 403 });
    }

    // Check if within 10-minute window
    const now = new Date();
    const appointmentTime = appointment.scheduledAt;
    const canJoin = isWithinInterval(now, {
      start: subMinutes(appointmentTime, 10),
      end: addMinutes(appointmentTime, 60),
    });

    if (!canJoin) {
      const minutesUntilStart = Math.floor((appointmentTime.getTime() - now.getTime()) / 1000 / 60);
      return NextResponse.json(
        { 
          error: 'Outside allowed time window',
          minutesUntilStart,
          canJoinAt: subMinutes(appointmentTime, 10).toISOString(),
        },
        { status: 403 }
      );
    }

    // Generate appropriate identity
    const identity = isClient 
      ? `client-${appointment.client.id}-${appointment.client.firstName || 'Client'}`
      : `artist-${appointment.artist.id}-${appointment.artist.firstName || 'Artist'}`;

    // Create access token
    const token = new AccessToken(
      twilioConfig.accountSid,
      twilioConfig.apiKeySid,
      twilioConfig.apiKeySecret,
      { 
        ttl: 3600, // 1 hour
        identity,
      }
    );

    // Create video grant
    const videoGrant = new VideoGrant({
      room: appointment.consultation.twilioRoomName || undefined,
    });

    // Add grant to token
    token.addGrant(videoGrant);

    // Update waiting room status if needed
    if (isClient && appointment.consultation.waitingRoomStatus === 'empty') {
      await prisma.consultation.update({
        where: { id: appointment.consultation.id },
        data: { waitingRoomStatus: 'client-waiting' },
      });
    }

    return NextResponse.json({
      token: token.toJwt(),
      identity,
      roomName: appointment.consultation.twilioRoomName,
      isHost: isArtist,
      appointment: {
        id: appointment.id,
        scheduledAt: appointment.scheduledAt,
        duration: appointment.duration,
      },
      artist: {
        name: appointment.artist.name,
        profileImage: appointment.artist.profileImage,
      },
      client: {
        name: appointment.client.name || appointment.client.username,
      },
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    );
  }
}