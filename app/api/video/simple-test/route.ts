import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { twilioClient, twilioConfig } from '../../../../lib/twilio';
import { jwt } from 'twilio';

const { AccessToken } = jwt;
const { VideoGrant } = AccessToken;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple room name without special characters
    const roomName = `test${Date.now()}`;
    const identity = `user${Date.now()}`;

    // Create room
    const room = await twilioClient.video.v1.rooms.create({
      uniqueName: roomName,
      maxParticipants: 2,
      videoCodecs: ['VP8', 'H264'],
    });

    // Create token with minimal configuration
    const token = new AccessToken(
      twilioConfig.accountSid,
      twilioConfig.apiKeySid,
      twilioConfig.apiKeySecret,
      {
        ttl: 3600,
        identity: identity,
      }
    );

    // Add video grant
    const videoGrant = new VideoGrant({
      room: roomName,
    });
    token.addGrant(videoGrant);

    const jwtToken = token.toJwt();

    // Create a simple HTML page with inline JavaScript
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Twilio Video Simple Test</title>
  <script src="https://sdk.twilio.com/js/video/releases/2.32.0/twilio-video.min.js"></script>
</head>
<body>
  <h1>Simple Twilio Video Test</h1>
  <div id="status">Initializing...</div>
  <div id="local-video" style="width: 300px; height: 200px; background: #ccc; margin: 10px 0;"></div>
  <div id="error" style="color: red;"></div>
  <button onclick="disconnect()">Disconnect</button>
  
  <script>
    const token = '${jwtToken}';
    const roomName = '${roomName}';
    const identity = '${identity}';
    let room = null;
    
    console.log('Token:', token);
    console.log('Room:', roomName);
    console.log('Identity:', identity);
    
    document.getElementById('status').textContent = 'Connecting...';
    
    Twilio.Video.connect(token, {
      name: roomName,
      audio: true,
      video: { width: 640 }
    }).then(connectedRoom => {
      console.log('Connected to room:', connectedRoom.name);
      document.getElementById('status').textContent = 'Connected to room: ' + connectedRoom.name;
      room = connectedRoom;
      
      // Attach local video
      const localVideoTrack = Array.from(connectedRoom.localParticipant.videoTracks.values())[0]?.track;
      if (localVideoTrack) {
        document.getElementById('local-video').appendChild(localVideoTrack.attach());
      }
      
    }).catch(error => {
      console.error('Connection error:', error);
      document.getElementById('error').textContent = 'Error: ' + error.message + ' (Code: ' + error.code + ')';
      document.getElementById('status').textContent = 'Failed to connect';
    });
    
    function disconnect() {
      if (room) {
        room.disconnect();
        window.location.href = '/video-test';
      }
    }
  </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('[Simple Test] Error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error.message,
    }, { status: 500 });
  }
}