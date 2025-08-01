"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCSRFToken } from "@/hooks/useCSRFToken"
import { ConfirmationModal } from "@/components/ui/ConfirmationModal"

interface ArtistProfile {
  id: string
  username: string
  email: string
  name: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  specialties: string[]
  yearsExperience: number | null
  location: string | null
  timezone: string
  badges: string[]
  hourlyRate: number | null
  isAvailable: boolean
}

interface ProfileEditFormProps {
  initialData: ArtistProfile
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')
  const csrfToken = useCSRFToken()
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    bio: initialData.bio || "",
    specialties: initialData.specialties.join(", "),
    yearsExperience: initialData.yearsExperience?.toString() || "",
    location: initialData.location || "",
    timezone: initialData.timezone || "America/Los_Angeles",
    badges: initialData.badges.join(", "),
    hourlyRate: initialData.hourlyRate?.toString() || "",
    isAvailable: initialData.isAvailable,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert comma-separated strings to arrays
      const specialtiesArray = formData.specialties
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      const badgesArray = formData.badges
        .split(",")
        .map(b => b.trim())
        .filter(b => b.length > 0)

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio || null,
        specialties: specialtiesArray,
        yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
        location: formData.location || null,
        timezone: formData.timezone,
        badges: badgesArray,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        isAvailable: formData.isAvailable,
      }

      const response = await fetch("/api/artist/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setModalType('success')
      setModalMessage('Your profile has been updated successfully!')
      setShowModal(true)
      router.refresh()
    } catch (err) {
      setModalType('error')
      setModalMessage(err instanceof Error ? err.message : "An error occurred while updating your profile")
      setShowModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Read-only fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username (cannot be changed)
          </label>
          <input
            type="text"
            value={initialData.username}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (cannot be changed)
          </label>
          <input
            type="email"
            value={initialData.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
          />
        </div>
      </div>

      {/* Editable fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          maxLength={1000}
          placeholder="Tell clients about yourself..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1000 characters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            type="number"
            id="yearsExperience"
            name="yearsExperience"
            value={formData.yearsExperience}
            onChange={handleInputChange}
            min="0"
            max="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            id="hourlyRate"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleInputChange}
            min="0"
            max="10000"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          maxLength={100}
          placeholder="e.g., New York, NY"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="America/Phoenix">Arizona Time (MST)</option>
          <option value="America/Anchorage">Alaska Time (AKT)</option>
          <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Your availability hours will be in this timezone</p>
      </div>

      <div>
        <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 mb-1">
          Specialties (comma-separated)
        </label>
        <input
          type="text"
          id="specialties"
          name="specialties"
          value={formData.specialties}
          onChange={handleInputChange}
          placeholder="e.g., Bridal, Editorial, Natural Glam"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Enter your specialties separated by commas</p>
      </div>

      <div>
        <label htmlFor="badges" className="block text-sm font-medium text-gray-700 mb-1">
          Badges & Certifications (comma-separated)
        </label>
        <input
          type="text"
          id="badges"
          name="badges"
          value={formData.badges}
          onChange={handleInputChange}
          placeholder="e.g., Certified Pro, Best of Beauty 2024"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Enter your badges separated by commas</p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAvailable"
          name="isAvailable"
          checked={formData.isAvailable}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
          I am available for bookings
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        message={modalMessage}
      />
    </form>
  )
}