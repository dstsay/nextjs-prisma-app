import { NextRequest, NextResponse } from 'next/server';
import { twilioClient, twilioConfig } from '../../../../lib/twilio';
import { jwt } from 'twilio';

const { AccessToken } = jwt;

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    credentials: {
      hasAccountSid: !!twilioConfig.accountSid,
      hasApiKeySid: !!twilioConfig.apiKeySid,
      hasApiKeySecret: !!twilioConfig.apiKeySecret,
      accountSid: twilioConfig.accountSid ? `${twilioConfig.accountSid.substring(0, 10)}...` : 'NOT SET',
      apiKeySid: twilioConfig.apiKeySid ? `${twilioConfig.apiKeySid.substring(0, 10)}...` : 'NOT SET',
    },
    tests: {}
  };

  // Test 1: Check if we can list rooms (verifies REST API credentials)
  try {
    if (!twilioClient) {
      results.tests.restApi = {
        success: false,
        error: 'Twilio client not initialized'
      };
    } else {
      const rooms = await twilioClient.video.v1.rooms.list({ limit: 1 });
      results.tests.restApi = {
        success: true,
        message: 'Successfully connected to Twilio REST API',
        roomCount: rooms.length
      };
    }
  } catch (error: any) {
    results.tests.restApi = {
      success: false,
      error: error.message,
      code: error.code,
      status: error.status
    };
  }

  // Test 2: Create a minimal token and decode it
  try {
    const testIdentity = 'credential-test-' + Date.now();
    
    // Create token with exact same parameters as video calls
    const token = new AccessToken(
      twilioConfig.accountSid,
      twilioConfig.apiKeySid,
      twilioConfig.apiKeySecret,
      {
        ttl: 3600,
        identity: testIdentity,
      }
    );

    const jwtString = token.toJwt();
    
    // Decode the token to inspect it
    const parts = jwtString.split('.');
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    results.tests.tokenCreation = {
      success: true,
      tokenLength: jwtString.length,
      tokenPreview: jwtString.substring(0, 50) + '...',
      decoded: {
        header,
        payload: {
          jti: payload.jti,
          iss: payload.iss,
          sub: payload.sub,
          exp: payload.exp,
          iat: payload.iat,
          grants: payload.grants
        }
      }
    };

    // Verify the token structure
    const issues = [];
    if (payload.iss !== twilioConfig.apiKeySid) {
      issues.push(`ISS mismatch: expected ${twilioConfig.apiKeySid}, got ${payload.iss}`);
    }
    if (payload.sub !== twilioConfig.accountSid) {
      issues.push(`SUB mismatch: expected ${twilioConfig.accountSid}, got ${payload.sub}`);
    }
    if (!payload.grants || !payload.grants.identity) {
      issues.push('Missing identity grant');
    }

    if (issues.length > 0) {
      results.tests.tokenValidation = {
        success: false,
        issues
      };
    } else {
      results.tests.tokenValidation = {
        success: true,
        message: 'Token structure looks correct'
      };
    }

  } catch (error: any) {
    results.tests.tokenCreation = {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }

  // Test 3: Try creating a token with video grant
  try {
    const testIdentity = 'video-test-' + Date.now();
    const token = new AccessToken(
      twilioConfig.accountSid,
      twilioConfig.apiKeySid,
      twilioConfig.apiKeySecret,
      {
        ttl: 3600,
        identity: testIdentity,
      }
    );

    // Add video grant without room
    const { VideoGrant } = AccessToken;
    const videoGrant = new VideoGrant();
    token.addGrant(videoGrant);

    const jwtString = token.toJwt();
    const parts = jwtString.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    results.tests.videoGrantToken = {
      success: true,
      hasVideoGrant: !!payload.grants?.video,
      grants: payload.grants
    };

  } catch (error: any) {
    results.tests.videoGrantToken = {
      success: false,
      error: error.message
    };
  }

  // Summary
  const allTestsPassed = Object.values(results.tests).every((test: any) => test.success);
  results.summary = {
    allTestsPassed,
    credentialsValid: results.tests.restApi?.success || false,
    tokenCreationWorks: results.tests.tokenCreation?.success || false,
    recommendation: allTestsPassed 
      ? 'All tests passed. Credentials appear to be valid.'
      : 'Some tests failed. Check the detailed results above.'
  };

  return NextResponse.json(results, { 
    status: allTestsPassed ? 200 : 500,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}