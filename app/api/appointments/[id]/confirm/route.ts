import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { twilioClient, generateRoomName, ROOM_CONFIG } from '../../../../../lib/twilio';
import { auth } from '@/lib/auth';
import { sendAppointmentConfirmationEmail } from '../../../../../src/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        artist: true,
        consultation: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if appointment is already confirmed
    if (appointment.status === 'CONFIRMED') {
      return NextResponse.json({ error: 'Appointment already confirmed' }, { status: 400 });
    }

    // Create or get consultation record
    let consultation = appointment.consultation;
    if (!consultation) {
      consultation = await prisma.consultation.create({
        data: {
          appointmentId: appointment.id,
          clientId: appointment.clientId,
          artistId: appointment.artistId,
        },
      });
    }

    // Generate room name
    const roomName = generateRoomName(appointment.id);

    // Create Twilio room
    try {
      const room = await twilioClient.video.v1.rooms.create({
        uniqueName: roomName,
        ...ROOM_CONFIG,
        statusCallback: `${process.env.NEXTAUTH_URL}/api/video/webhooks/status-callback`,
      });

      // Update consultation with Twilio room info
      await prisma.consultation.update({
        where: { id: consultation.id },
        data: {
          twilioRoomSid: room.sid,
          twilioRoomName: roomName,
          twilioRoomStatus: 'pending',
          waitingRoomStatus: 'empty',
          videoRoomUrl: `/consultation/${appointment.id}/join`,
        },
      });

      // Update appointment status
      await prisma.appointment.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      });

      // Send confirmation emails with video links
      try {
        // Send email to client
        await sendAppointmentConfirmationEmail(
          appointment.client.email,
          appointment.client.name || appointment.client.username,
          {
            id: appointment.id,
            date: appointment.scheduledAt,
            artistName: appointment.artist.name,
            clientName: appointment.client.name || appointment.client.username,
            hourlyRate: appointment.artist.hourlyRate || 0,
            type: 'client',
            notes: appointment.notes || undefined,
          }
        );

        // Send email to artist
        await sendAppointmentConfirmationEmail(
          appointment.artist.email,
          appointment.artist.name,
          {
            id: appointment.id,
            date: appointment.scheduledAt,
            artistName: appointment.artist.name,
            clientName: appointment.client.name || appointment.client.username,
            hourlyRate: appointment.artist.hourlyRate || 0,
            type: 'artist',
            notes: appointment.notes || undefined,
          }
        );
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // Don't fail the entire request if emails fail
      }

      return NextResponse.json({
        success: true,
        appointment: {
          ...appointment,
          status: 'CONFIRMED',
        },
        consultation: {
          ...consultation,
          twilioRoomName: roomName,
          videoRoomUrl: `/consultation/${appointment.id}/join`,
        },
      });
    } catch (twilioError) {
      console.error('Twilio room creation error:', twilioError);
      return NextResponse.json(
        { error: 'Failed to create video room' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Appointment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm appointment' },
      { status: 500 }
    );
  }
}