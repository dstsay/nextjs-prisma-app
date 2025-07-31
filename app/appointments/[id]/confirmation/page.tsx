import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AppointmentConfirmationPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect('/auth/client/login');
  }

  // Get the appointment with all details
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          hourlyRate: true,
          profileImage: true,
        },
      },
      client: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
        },
      },
    },
  });

  if (!appointment) {
    notFound();
  }

  // Verify the user owns this appointment
  if (appointment.client.email !== session.user.email) {
    redirect('/appointments');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 px-6 py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              Your appointment has been successfully booked
            </p>
          </div>

          {/* Appointment Details */}
          <div className="px-6 py-8 space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Appointment Details
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {format(new Date(appointment.scheduledAt), 'EEEE, MMMM d, yyyy')}
                    <br />
                    <span className="text-sm">
                      {format(new Date(appointment.scheduledAt), 'h:mm a')}
                    </span>
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">
                    {appointment.type.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {appointment.duration || 60} minutes
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {appointment.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Makeup Artist
              </h2>
              
              <div className="flex items-center space-x-4">
                {appointment.artist.profileImage ? (
                  <img
                    src={appointment.artist.profileImage}
                    alt={appointment.artist.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-medium text-gray-600">
                      {appointment.artist.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {appointment.artist.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${appointment.artist.hourlyRate}/hour
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                What&apos;s Next?
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  You&apos;ll receive a confirmation email shortly
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  The artist will confirm your appointment
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  You can join the video consultation 10 minutes before the scheduled time
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/client/dashboard"
                className="flex-1 text-center bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/artists"
                className="flex-1 text-center bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
              >
                Browse More Artists
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}