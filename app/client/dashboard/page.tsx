import { requireClientAuth } from "@/lib/auth-helpers"
import { LogoutButton } from "@/components/auth/LogoutButton"

export default async function ClientDashboard() {
  const user = await requireClientAuth()

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
                Hello, {user.name || user.email}. You are logged in as a client.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900">Your Appointments</h3>
                <p className="text-blue-700 mt-2">No upcoming appointments</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900">Consultations</h3>
                <p className="text-green-700 mt-2">0 consultations completed</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900">Your Artists</h3>
                <p className="text-purple-700 mt-2">Browse artists to get started</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}