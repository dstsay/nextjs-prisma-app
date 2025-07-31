import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { twilioClient, twilioConfig, ROOM_CONFIG } from '../../../../lib/twilio';
import { jwt } from 'twilio';

const { AccessToken } = jwt;
const { VideoGrant } = AccessToken;

export async function POST(request: NextRequest) {
  try {
    // Log environment check
    console.log('[Video Test] Starting test...');
    console.log('[Video Test] Environment variables loaded:', {
      hasAccountSid: !!twilioConfig.accountSid,
      hasApiKeySid: !!twilioConfig.apiKeySid,
      hasApiKeySecret: !!twilioConfig.apiKeySecret,
      accountSid: twilioConfig.accountSid ? `${twilioConfig.accountSid.substring(0, 10)}...` : 'NOT SET',
      apiKeySid: twilioConfig.apiKeySid ? `${twilioConfig.apiKeySid.substring(0, 10)}...` : 'NOT SET',
    });

    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    // Generate test room name
    const testRoomName = `test-room-${Date.now()}`;
    const identity = `${role}-test-${session.user.email.split('@')[0]}-${Date.now()}`;

    console.log('[Video Test] Creating test room:', testRoomName);

    // Create test room
    let room;
    try {
      if (!twilioClient) {
        throw new Error('Twilio client not initialized. Check your credentials.');
      }

      room = await twilioClient.video.v1.rooms.create({
        uniqueName: testRoomName,
        ...ROOM_CONFIG,
        // Include webhook for test rooms to test the webhook handling
        statusCallback: `${process.env.NEXTAUTH_URL}/api/video/webhooks/status-callback`,
      });

      console.log('[Video Test] Room created successfully:', room.sid);
    } catch (roomError: any) {
      console.error('[Video Test] Room creation error:', roomError);
      return NextResponse.json({
        error: 'Failed to create test room',
        details: {
          message: roomError.message,
          code: roomError.code,
          status: roomError.status,
          moreInfo: roomError.moreInfo,
        },
      }, { status: 500 });
    }

    // Create access token
    console.log('[Video Test] Creating access token...');
    
    try {
      // Validate credentials
      if (!twilioConfig.accountSid || !twilioConfig.apiKeySid || !twilioConfig.apiKeySecret) {
        throw new Error('Missing Twilio credentials. Check your environment variables.');
      }

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
        room: testRoomName,
      });

      // Add grant to token
      token.addGrant(videoGrant);

      // Generate JWT
      const jwt = token.toJwt();

      console.log('[Video Test] Token created successfully');
      console.log('[Video Test] Token length:', jwt.length);
      console.log('[Video Test] Token preview:', jwt.substring(0, 50) + '...');
      console.log('[Video Test] Using Account SID:', twilioConfig.accountSid);
      console.log('[Video Test] Using API Key SID:', twilioConfig.apiKeySid);

      // Decode and log token for debugging
      try {
        const parts = jwt.split('.');
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        
        console.log('[Video Test] Token Header:', JSON.stringify(header));
        console.log('[Video Test] Token Payload:', {
          jti: payload.jti,
          iss: payload.iss,
          sub: payload.sub,
          identity: payload.grants?.identity,
          video: payload.grants?.video,
          exp: new Date(payload.exp * 1000).toISOString(),
          iat: new Date(payload.iat * 1000).toISOString()
        });
      } catch (decodeError) {
        console.error('[Video Test] Failed to decode token:', decodeError);
      }

      // Create test URLs based on role
      const testRoomUrl = role === 'client' 
        ? `/video-test/room?token=${encodeURIComponent(jwt)}&room=${encodeURIComponent(testRoomName)}&role=client`
        : `/video-test/room?token=${encodeURIComponent(jwt)}&room=${encodeURIComponent(testRoomName)}&role=artist`;

      return NextResponse.json({
        success: true,
        token: jwt,
        roomName: testRoomName,
        roomSid: room.sid,
        identity,
        role,
        testRoomUrl,
        credentials: {
          accountSid: twilioConfig.accountSid.substring(0, 10) + '...',
          apiKeySid: twilioConfig.apiKeySid.substring(0, 10) + '...',
          hasApiKeySecret: !!twilioConfig.apiKeySecret,
        },
        debug: {
          tokenLength: jwt.length,
          identityLength: identity.length,
          roomNameLength: testRoomName.length,
        }
      });
    } catch (tokenError: any) {
      console.error('[Video Test] Token creation error:', tokenError);
      
      // Clean up room if token creation failed
      if (room) {
        try {
          await twilioClient.video.v1.rooms(room.sid).update({ status: 'completed' });
        } catch (e) {
          console.error('[Video Test] Failed to clean up room:', e);
        }
      }

      return NextResponse.json({
        error: 'Failed to create access token',
        details: {
          message: tokenError.message,
          code: tokenError.code,
          stack: tokenError.stack,
        },
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[Video Test] Unexpected error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: {
        message: error.message,
        stack: error.stack,
      },
    }, { status: 500 });
  }
}