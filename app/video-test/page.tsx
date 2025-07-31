'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface TestResult {
  success: boolean;
  token?: string;
  roomName?: string;
  identity?: string;
  error?: string;
  details?: any;
}

export default function VideoTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<'client' | 'artist'>('client');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Video Test Page</h1>
          <p className="text-gray-600 mb-4">Please log in to test video functionality</p>
          <button
            onClick={() => router.push('/auth/client/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  const runTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/video/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTestResult({
          success: false,
          error: data.error || 'Test failed',
          details: data,
        });
      } else {
        setTestResult({
          success: true,
          token: data.token,
          roomName: data.roomName,
          identity: data.identity,
          details: data,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Network error or server issue',
        details: error instanceof Error ? error.message : error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinTestRoom = () => {
    if (testResult?.success && testResult.details?.testRoomUrl) {
      window.location.href = testResult.details.testRoomUrl;
    }
  };

  const debugToken = async () => {
    if (!testResult?.success || !testResult.token || !testResult.roomName) {
      alert('Please run a test first');
      return;
    }

    try {
      const response = await fetch('/api/video/debug-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: testResult.token,
          roomName: testResult.roomName,
        }),
      });

      const data = await response.json();
      console.log('Token Debug Results:', data);
      alert('Token debug results logged to console. Check browser DevTools.');
    } catch (error) {
      console.error('Debug error:', error);
      alert('Error debugging token. Check console.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Video Connection Test</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Test Twilio video connections without creating an appointment.
              Logged in as: <strong>{session.user?.email}</strong>
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test as:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="client"
                  checked={selectedRole === 'client'}
                  onChange={(e) => setSelectedRole(e.target.value as 'client' | 'artist')}
                  className="mr-2"
                />
                Client
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="artist"
                  checked={selectedRole === 'artist'}
                  onChange={(e) => setSelectedRole(e.target.value as 'artist' | 'artist')}
                  className="mr-2"
                />
                Artist
              </label>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={runTest}
              disabled={isLoading}
              className={`px-6 py-3 rounded font-medium text-white transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Testing...' : 'Run Video Test'}
            </button>
          </div>

          {testResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-2 ${
                testResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {testResult.success ? '✓ Test Successful' : '✗ Test Failed'}
              </h2>

              {testResult.error && (
                <div className="mb-4">
                  <p className="text-red-700 font-medium">Error: {testResult.error}</p>
                </div>
              )}

              {testResult.success && (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Room Name:</strong> {testResult.roomName}
                  </div>
                  <div>
                    <strong>Identity:</strong> {testResult.identity}
                  </div>
                  <div>
                    <strong>Token (first 50 chars):</strong>
                    <code className="block mt-1 p-2 bg-gray-100 rounded text-xs break-all">
                      {testResult.token?.substring(0, 50)}...
                    </code>
                  </div>
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  View Full Response
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </details>

              {testResult.success && testResult.details?.testRoomUrl && (
                <div className="mt-4 space-x-2">
                  <button
                    onClick={joinTestRoom}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Join Test Room
                  </button>
                  <button
                    onClick={debugToken}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Debug Token
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Debugging Tools:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check browser console for detailed errors</li>
              <li>• Ensure Twilio credentials are set in .env.local</li>
              <li>• Verify you&apos;re using ngrok URL if testing webhooks</li>
              <li>• Token should start with &quot;eyJ&quot; (base64 encoded)</li>
            </ul>
            <div className="mt-4 space-y-2">
              <div>
                <a
                  href="/api/video/verify-credentials"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Verify Twilio Credentials →
                </a>
              </div>
              <div>
                <a
                  href="/api/video/simple-test"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Simple Token Test (bypasses URL encoding) →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}