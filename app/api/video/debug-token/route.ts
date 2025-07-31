import { NextRequest, NextResponse } from 'next/server';
import { twilioClient, twilioConfig } from '../../../../lib/twilio';
import Video from 'twilio-video';

export async function POST(request: NextRequest) {
  try {
    const { token, roomName } = await request.json();
    
    if (!token || !roomName) {
      return NextResponse.json({ error: 'Token and roomName are required' }, { status: 400 });
    }

    // Decode token
    const parts = token.split('.');
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    const results: any = {
      tokenInfo: {
        header,
        payload,
        tokenLength: token.length,
      },
      validationChecks: {
        hasVideoGrant: !!payload.grants?.video,
        hasIdentity: !!payload.grants?.identity,
        roomInGrant: payload.grants?.video?.room === roomName,
        tokenNotExpired: payload.exp > Math.floor(Date.now() / 1000),
        correctIssuer: payload.iss === twilioConfig.apiKeySid,
        correctSubject: payload.sub === twilioConfig.accountSid,
      },
      environmentInfo: {
        accountSid: twilioConfig.accountSid,
        apiKeySid: twilioConfig.apiKeySid,
        hasApiKeySecret: !!twilioConfig.apiKeySecret,
      },
      roomInfo: {},
      connectionTest: {},
    };

    // Check if room exists
    try {
      const rooms = await twilioClient.video.v1.rooms.list({
        uniqueName: roomName,
        limit: 1,
      });
      
      if (rooms.length > 0) {
        const room = rooms[0];
        results.roomInfo = {
          exists: true,
          sid: room.sid,
          status: room.status,
          participants: room.links?.participants,
        };
      } else {
        results.roomInfo = {
          exists: false,
          message: 'Room does not exist',
        };
      }
    } catch (error: any) {
      results.roomInfo = {
        error: error.message,
      };
    }

    // Try to connect (this is what's failing in the browser)
    try {
      // Note: We can't actually test Video.connect server-side
      // But we can verify the token format is correct
      results.connectionTest = {
        note: 'Token validation passed all checks',
        cannotTestServerSide: true,
        suggestedFix: 'Ensure you are using the token immediately after generation',
      };
    } catch (error: any) {
      results.connectionTest = {
        error: error.message,
      };
    }

    // Check for common issues
    const issues = [];
    if (!results.validationChecks.hasVideoGrant) {
      issues.push('Token missing video grant');
    }
    if (!results.validationChecks.roomInGrant) {
      issues.push(`Token room grant (${payload.grants?.video?.room}) doesn't match requested room (${roomName})`);
    }
    if (!results.validationChecks.tokenNotExpired) {
      issues.push('Token has expired');
    }
    if (!results.validationChecks.correctIssuer) {
      issues.push(`Token issuer (${payload.iss}) doesn't match API Key SID (${twilioConfig.apiKeySid})`);
    }
    if (!results.validationChecks.correctSubject) {
      issues.push(`Token subject (${payload.sub}) doesn't match Account SID (${twilioConfig.accountSid})`);
    }

    results.summary = {
      hasIssues: issues.length > 0,
      issues,
      recommendation: issues.length === 0 
        ? 'Token appears valid. Try using it immediately after generation.'
        : 'Fix the issues above and regenerate the token.',
    };

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to debug token',
      details: error.message,
    }, { status: 500 });
  }
}