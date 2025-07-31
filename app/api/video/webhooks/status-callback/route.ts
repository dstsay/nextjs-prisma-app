import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Twilio sends these event types
type TwilioRoomEvent = 
  | 'room-created'
  | 'room-ended' 
  | 'room-updated'
  | 'participant-connected'
  | 'participant-disconnected'
  | 'recording-started'
  | 'recording-completed'
  | 'recording-failed';

interface TwilioStatusCallback {
  RoomName: string;
  RoomSid: string;
  RoomStatus: string;
  StatusCallbackEvent: TwilioRoomEvent;
  Timestamp: string;
  AccountSid: string;
  ParticipantSid?: string;
  ParticipantIdentity?: string;
  ParticipantStatus?: string;
  RecordingSid?: string;
  RecordingStatus?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const data: Partial<TwilioStatusCallback> = {};
    
    // Convert FormData to object
    formData.forEach((value, key) => {
      (data as any)[key] = value.toString();
    });

    console.log('Twilio webhook received:', {
      event: data.StatusCallbackEvent,
      roomName: data.RoomName,
      roomStatus: data.RoomStatus,
      participant: data.ParticipantIdentity,
    });

    // Check if this is a test room
    if (data.RoomName?.startsWith('test-') || data.RoomName?.startsWith('test')) {
      console.log('Test room webhook received, skipping consultation lookup:', data.RoomName);
      // Return success for test rooms to prevent Twilio from retrying
      return NextResponse.json({ success: true, message: 'Test room webhook processed' });
    }

    // Extract appointment ID from room name (format: consultation-{appointmentId})
    const appointmentId = data.RoomName?.replace('consultation-', '');
    
    if (!appointmentId) {
      console.error('Invalid room name format:', data.RoomName);
      return NextResponse.json({ error: 'Invalid room name' }, { status: 400 });
    }

    // Find the consultation
    const consultation = await prisma.consultation.findFirst({
      where: { appointmentId },
      include: { appointment: true },
    });

    if (!consultation) {
      console.error('Consultation not found for appointment:', appointmentId);
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // Handle different event types
    switch (data.StatusCallbackEvent) {
      case 'room-created':
        await prisma.consultation.update({
          where: { id: consultation.id },
          data: {
            twilioRoomStatus: 'created',
            twilioRoomSid: data.RoomSid,
          },
        });
        break;

      case 'participant-connected':
        // Check if this is the first participant (client waiting)
        const isClient = data.ParticipantIdentity?.startsWith('client-');
        const isArtist = data.ParticipantIdentity?.startsWith('artist-');
        
        if (isClient && consultation.waitingRoomStatus === 'empty') {
          await prisma.consultation.update({
            where: { id: consultation.id },
            data: { waitingRoomStatus: 'client-waiting' },
          });
        }
        
        // Log participant connection
        console.log(`${isClient ? 'Client' : 'Artist'} connected:`, data.ParticipantIdentity);
        break;

      case 'participant-disconnected':
        // Check if all participants have left
        console.log('Participant disconnected:', data.ParticipantIdentity);
        
        // You might want to check if both participants have disconnected
        // and update the session status accordingly
        break;

      case 'room-ended':
        // Room has ended, update status
        await prisma.consultation.update({
          where: { id: consultation.id },
          data: {
            twilioRoomStatus: 'completed',
            sessionEndedAt: new Date(),
            endedAt: new Date(),
          },
        });

        // Update appointment status if it was in progress
        if (consultation.appointment.status === 'IN_PROGRESS') {
          await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'COMPLETED' },
          });
        }
        break;

      case 'recording-started':
        await prisma.consultation.update({
          where: { id: consultation.id },
          data: { recordingSid: data.RecordingSid },
        });
        break;

      case 'recording-completed':
        console.log('Recording completed:', data.RecordingSid);
        // Handle recording completion if needed
        break;

      default:
        console.log('Unhandled event type:', data.StatusCallbackEvent);
    }

    // Return success response to Twilio
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 to prevent Twilio from retrying
    return NextResponse.json({ error: 'Processing error' }, { status: 200 });
  }
}

// Twilio also supports GET for webhook validation
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Twilio webhook endpoint active' 
  });
}