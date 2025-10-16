import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import {
  signIn,
  signUp,
  logOut,
  signInWithGoogle,
  signInWithFacebook,
  resetPassword,
  changePassword
} from '@/services/authServices'
import sessionTracker from '@/utils/sessionTracker'
import { getUserByUid, updateUser } from '@/services/userService'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async (userId) => {
    try {
      const userData = await getUserByUid(userId)
      if (userData) {
        setUserRole(userData.role)

        // Check if auth email is different from user data email
        if (
          auth.currentUser?.email &&
          auth.currentUser.email !== userData.email
        ) {
          const updateResult = await updateUser(userId, {
            email: auth.currentUser.email,
            pendingEmail: null,
            updatedAt: new Date()
          })

          if (updateResult.success) {
            setCurrentUser((prevUser) => ({
              ...auth.currentUser,
              email: auth.currentUser.email,
              pendingEmail: null,
              updatedAt: new Date()
            }))
          }
        } else {
          setCurrentUser((prevUser) => ({
            ...auth.currentUser,
            ...userData
          }))
        }
      } else {
        setUserRole(null)
      }
    } catch (error) {
      setUserRole(null)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Always update the base auth user first
        setCurrentUser(user)

        // Then fetch and merge the Firestore data
        await fetchUserData(user.uid)
        sessionTracker.startSession(user.uid)
      } else {
        sessionTracker.endSession()
        setCurrentUser(null)
        setUserRole(null)
      }

      setLoading(false)
    })

    return () => {
      sessionTracker.endSession()
      unsubscribe()
    }
  }, [])

  // Add a useEffect to handle email updates
  useEffect(() => {
    if (currentUser?.email && currentUser.uid) {
      fetchUserData(currentUser.uid)
    }
  }, [currentUser?.email])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userRole,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithFacebook,
        resetPassword,
        changePassword,
        logOut,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
