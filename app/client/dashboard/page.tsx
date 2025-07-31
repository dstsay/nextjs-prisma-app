'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { AppointmentCard } from '../../../components/dashboard/AppointmentCard';
import Link from 'next/link';

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  type: string;
  duration?: number;
  artist: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  consultation?: {
    id: string;
  } | null;
}

interface DashboardData {
  appointments: Appointment[];
  completedConsultations: number;
  upcomingAppointments: number;
}

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    appointments: [],
    completedConsultations: 0,
    upcomingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/client/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/client/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const upcomingAppointments = dashboardData.appointments.filter(
    apt => apt.status === 'CONFIRMED' || apt.status === 'PENDING'
  );

  const pastAppointments = dashboardData.appointments.filter(
    apt => apt.status === 'COMPLETED' || apt.status === 'CANCELLED'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            <LogoutButton />
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Welcome back!</h2>
              <p className="text-gray-600">
                Hello, {session.user?.name || session.user?.email}. You are logged in as a client.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900">Upcoming Appointments</h3>
                <p className="text-2xl font-bold text-blue-700 mt-2">
                  {dashboardData.upcomingAppointments}
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900">Consultations Completed</h3>
                <p className="text-2xl font-bold text-green-700 mt-2">
                  {dashboardData.completedConsultations}
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900">Browse Artists</h3>
                <Link 
                  href="/artists" 
                  className="text-purple-700 mt-2 inline-block hover:text-purple-800"
                >
                  Find makeup artists →
                </Link>
              </div>
            </div>

            {/* Upcoming Appointments Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Upcoming Appointments
              </h2>
              {upcomingAppointments.length > 0 ? (
                <div className="grid gap-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">No upcoming appointments</p>
                  <Link
                    href="/artists"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Book an Appointment
                  </Link>
                </div>
              )}
            </div>

            {/* Past Appointments Section */}
            {pastAppointments.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Past Appointments
                </h2>
                <div className="grid gap-4">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}