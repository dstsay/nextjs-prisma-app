import { requireArtistAuth } from "@/lib/auth-helpers"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { ProfileHeader } from "@/components/artist/ProfileHeader"
import { TabNavigation } from "@/components/artist/TabNavigation"
import { ProfileEditForm } from "@/components/artist/ProfileEditForm"
import { PortfolioManager } from "@/components/artist/PortfolioManager"
import { AvailabilityManager } from "../../../components/artist/AvailabilityManager"
import { ArtistAppointmentCard } from "../../../components/dashboard/ArtistAppointmentCard"
import { prisma } from "@/lib/prisma"

export default async function ArtistDashboard() {
  const user = await requireArtistAuth()
  
  // Fetch complete artist profile data securely using authenticated user ID
  const artistProfile = await prisma.makeupArtist.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      bio: true,
      specialties: true,
      yearsExperience: true,
      location: true,
      timezone: true,
      badges: true,
      hourlyRate: true,
      isAvailable: true,
      profileImage: true,
      portfolioImages: true,
      reviews: {
        select: {
          rating: true
        }
      }
    }
  })

  if (!artistProfile) {
    throw new Error("Artist profile not found")
  }

  // Calculate average rating
  const averageRating = artistProfile.reviews.length > 0
    ? artistProfile.reviews.reduce((sum, review) => sum + review.rating, 0) / artistProfile.reviews.length
    : 0
  const totalReviews = artistProfile.reviews.length

  // Fetch appointments and calculate statistics
  const appointments = await prisma.appointment.findMany({
    where: { artistId: user.id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
      consultation: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  // Calculate statistics
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    apt => 
      (apt.status === 'CONFIRMED' || apt.status === 'PENDING') &&
      apt.scheduledAt > now
  );
  
  const completedConsultations = appointments.filter(
    apt => apt.status === 'COMPLETED' && apt.type === 'CONSULTATION'
  ).length;

  const uniqueClients = new Set(appointments.map(apt => apt.clientId)).size;

  // Create tabs for the dashboard
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Upcoming Appointments</h3>
              <p className="text-2xl font-bold text-blue-700 mt-2">{upcomingAppointments.length}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Total Clients</h3>
              <p className="text-2xl font-bold text-green-700 mt-2">{uniqueClients}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900">Consultations Completed</h3>
              <p className="text-2xl font-bold text-purple-700 mt-2">{completedConsultations}</p>
            </div>
          </div>

          {/* Upcoming Appointments List */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upcoming Appointments
            </h2>
            {upcomingAppointments.length > 0 ? (
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <ArtistAppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No upcoming appointments scheduled</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: "profile",
      label: "Edit Profile",
      content: (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Your Profile</h2>
          <ProfileEditForm initialData={artistProfile} />
        </div>
      )
    },
    {
      id: "portfolio",
      label: "Portfolio",
      content: (
        <PortfolioManager 
          artistId={artistProfile.id} 
          portfolioImages={artistProfile.portfolioImages || []} 
        />
      )
    },
    {
      id: "availability",
      label: "Availability",
      content: <AvailabilityManager />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Artist Dashboard</h1>
            <LogoutButton />
          </div>

          {/* Profile Header */}
          <ProfileHeader 
            artist={artistProfile} 
            averageRating={averageRating}
            totalReviews={totalReviews}
          />

          {/* Tabbed Content */}
          <div className="bg-white shadow rounded-lg p-6">
            <TabNavigation tabs={tabs} defaultTab="overview" />
          </div>
        </div>
      </div>
    </div>
  )
}