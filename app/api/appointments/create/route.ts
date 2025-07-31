import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { parse, format } from 'date-fns';
import { sendAppointmentConfirmationEmail } from '../../../../src/lib/email';
import { twilioClient, generateRoomName, ROOM_CONFIG } from '../../../../lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { artistId, date, time, type = 'CONSULTATION' } = body;

    if (!artistId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the client
    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'You must be logged in as a client to book appointments' },
        { status: 403 }
      );
    }

    // Verify the artist exists and is available
    const artist = await prisma.makeupArtist.findUnique({
      where: { id: artistId },
    });

    if (!artist || !artist.isAvailable) {
      return NextResponse.json(
        { error: 'Artist not found or unavailable' },
        { status: 404 }
      );
    }

    // Parse the date and time
    const appointmentDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Check if the time slot is still available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        artistId,
        scheduledAt: appointmentDate,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Check if it's in the future
    if (appointmentDate <= new Date()) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past' },
        { status: 400 }
      );
    }

    // Create the appointment
    // Auto-confirm consultation appointments for immediate video access
    const isConsultation = type === 'CONSULTATION';
    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        artistId,
        scheduledAt: appointmentDate,
        type,
        status: isConsultation ? 'CONFIRMED' : 'PENDING',
        notes: `${type} appointment booked online`,
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
            hourlyRate: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // For consultations, create Twilio room and consultation record
    let consultation = null;
    if (isConsultation) {
      try {
        // Create consultation record
        consultation = await prisma.consultation.create({
          data: {
            appointmentId: appointment.id,
            clientId: client.id,
            artistId,
          },
        });

        // Generate room name
        const roomName = generateRoomName(appointment.id);

        // Create Twilio room
        const room = await twilioClient.video.v1.rooms.create({
          uniqueName: roomName,
          ...ROOM_CONFIG,
          statusCallback: `${process.env.NEXTAUTH_URL}/api/video/webhooks/status-callback`,
        });

        // Update consultation with Twilio room info
        consultation = await prisma.consultation.update({
          where: { id: consultation.id },
          data: {
            twilioRoomSid: room.sid,
            twilioRoomName: roomName,
            twilioRoomStatus: 'pending',
            waitingRoomStatus: 'empty',
            videoRoomUrl: `/consultation/${appointment.id}/join`,
          },
        });
      } catch (twilioError) {
        console.error('Twilio room creation error:', twilioError);
        // Don't fail the appointment creation, just log the error
      }
    }

    // Send confirmation emails to both client and artist
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

      console.log('Confirmation emails sent successfully');
    } catch (emailError) {
      // Log error but don't fail the booking
      console.error('Failed to send confirmation emails:', emailError);
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        scheduledAt: appointment.scheduledAt.toISOString(),
        type: appointment.type,
        status: appointment.status,
        artist: appointment.artist,
        client: appointment.client,
      },
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}