import twilio from 'twilio';
import { RoomVideoCodec } from 'twilio/lib/rest/video/v1/room';

// During build, these might not be available
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const apiKeySid = process.env.TWILIO_API_KEY_SID || '';
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET || '';

// Only throw errors at runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  if (!accountSid) {
    console.warn('TWILIO_ACCOUNT_SID is not defined');
  }
  if (!apiKeySid) {
    console.warn('TWILIO_API_KEY_SID is not defined');
  }
  if (!apiKeySecret) {
    console.warn('TWILIO_API_KEY_SECRET is not defined');
  }
}

// Initialize Twilio client
// Note: For server-side operations, we use Account SID + Auth Token or API Key
// For video tokens, we use API Key SID + API Key Secret
export const twilioClient = accountSid && apiKeySid && apiKeySecret 
  ? twilio(apiKeySid, apiKeySecret, { accountSid })
  : null as any;

// Export configuration
export const twilioConfig = {
  accountSid,
  apiKeySid,
  apiKeySecret,
};

// Helper function to generate unique room names
export function generateRoomName(appointmentId: string): string {
  return `consultation-${appointmentId}`;
}

// Video codec preferences for mobile optimization
export const VIDEO_CODECS: RoomVideoCodec[] = ['VP8', 'H264'];

// Room configuration defaults
// Note: Twilio no longer requires explicit room types - they use "Go rooms" that auto-scale
export const ROOM_CONFIG = {
  maxParticipants: 2,
  videoCodecs: VIDEO_CODECS,
  recordParticipants: false, // Can be enabled later
};