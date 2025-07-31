# Testing Twilio Video with ngrok

This guide explains how to test Twilio video conferencing locally with webhook support using ngrok.

## Why Use ngrok?

Twilio needs to send webhook notifications to your application for room events (participant joined, room ended, etc.). Since your local development server isn't accessible from the internet, ngrok creates a secure tunnel that Twilio can reach.

## Setup Steps

### 1. Install ngrok

```bash
# Using npm
npm install -g ngrok

# Or download from https://ngrok.com
```

### 2. Start Your Development Server

```bash
npm run dev
```

Your app should be running at http://localhost:3000

### 3. Start ngrok Tunnel

In a new terminal window:

```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3000
```

### 4. Update Your Environment

1. Copy your ngrok URL (e.g., `https://abc123def456.ngrok.io`)
2. Edit `.env.local`
3. Update `NEXTAUTH_URL`:

```bash
# Comment out the localhost URL
# NEXTAUTH_URL="http://localhost:3000"
# Use your ngrok URL
NEXTAUTH_URL="https://abc123def456.ngrok.io"
```

### 5. Restart Your Dev Server

Stop your dev server (Ctrl+C) and restart it:

```bash
npm run dev
```

## Testing the Video Flow

1. **Login** to your application using the ngrok URL
2. **Book an appointment** or find an existing one
3. **Confirm the appointment** - This creates the Twilio room
4. **Join the video consultation** within the 10-minute window
5. **Check the console** - You should see webhook events being logged

## What the Webhook Tracks

The webhook endpoint (`/api/video/webhooks/status-callback`) receives these events:

- **room-created**: Room is ready
- **participant-connected**: Client or artist joined
- **participant-disconnected**: Someone left
- **room-ended**: Session completed
- **recording-started/completed**: If recording is enabled

## Debugging

### View Webhook Requests

ngrok provides a web interface at http://127.0.0.1:4040 where you can:
- See all incoming webhook requests from Twilio
- Inspect request/response details
- Replay requests for debugging

### Check Logs

The webhook handler logs all events:

```typescript
console.log('Twilio webhook received:', {
  event: data.StatusCallbackEvent,
  roomName: data.RoomName,
  roomStatus: data.RoomStatus,
  participant: data.ParticipantIdentity,
});
```

## Important Notes

1. **Don't Commit ngrok URLs**: Always change `NEXTAUTH_URL` back to `http://localhost:3000` before committing

2. **ngrok Sessions**: Free ngrok URLs change each time you restart ngrok. Update `.env.local` with the new URL each session.

3. **Authentication**: Some auth providers may not work with ngrok URLs. Username/password auth will work fine.

4. **Production**: In production, webhooks will automatically use your real domain from the production `NEXTAUTH_URL`.

## Troubleshooting

### Webhook Not Receiving Events
- Ensure ngrok is running
- Check that `NEXTAUTH_URL` in `.env.local` matches your ngrok URL
- Restart your dev server after changing environment variables
- Check ngrok web interface for incoming requests

### Authentication Issues
- Clear your browser cookies for the ngrok domain
- Try incognito/private browsing mode
- Make sure you're accessing via the ngrok URL, not localhost

## Cleanup

When done testing:

1. Stop ngrok (Ctrl+C in the ngrok terminal)
2. Update `.env.local` back to localhost:
   ```bash
   NEXTAUTH_URL="http://localhost:3000"
   ```
3. Restart your dev server