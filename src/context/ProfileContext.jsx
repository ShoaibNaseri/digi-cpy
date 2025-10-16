import { createContext, useContext, useState, useCallback } from 'react'
import { updateUser, getUserByUid } from '@/services/userService'

const ProfileContext = createContext()

export function useProfile() {
  return useContext(ProfileContext)
}

export function ProfileProvider({ children }) {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const userData = await getUserByUid(userId)

      setProfileData(userData)
    } catch (error) {
      setError('Failed to load profile information')
      setProfileData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUserProfile = useCallback(async (userId, data) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      await updateUser(userId, data)

      setProfileData((prevData) => ({
        ...prevData,
        ...data,
        updatedAt: new Date()
      }))

      return true
    } catch (error) {
      setError('Failed to update profile')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        profileData,
        setProfileData,
        loading,
        error,
        fetchUserProfile,
        updateUserProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
