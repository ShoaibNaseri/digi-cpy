import React, { useState } from 'react'
import './DownloadMyData.css'
import { downloadUserData } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'

const DownloadMyData = () => {
  const { currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState('')

  const handleDownload = async () => {
    try {
      if (!currentUser) {
        setDownloadStatus('Error: User not logged in')
        return
      }

      setIsLoading(true)
      setDownloadStatus('Preparing your data...')

      // Use the correct property based on the current user ID structure
      const userId = currentUser.uid || currentUser.id // Try both possible ID properties

      if (!userId) {
        throw new Error('User ID not found')
      }

      const userData = await downloadUserData(userId)

      // Create a blob and download link
      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      // Create download link and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `user_data_${userId}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDownloadStatus('Download completed!')
      setTimeout(() => setDownloadStatus(''), 3000)
    } catch (error) {
      console.error('Error downloading data:', error)
      setDownloadStatus(`Failed to download data: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/**
       * Downloads all user data including:
       * - Personal profile (users collection)
       * - Trusted adults information
       * - School data
       * - Payment history (for parents)
       * - Student quizzes and results
       * - Messages
       * - Class information
       * - Incident reports
       * - User activity logs
       */}
      <button
        className='download-data-button'
        onClick={handleDownload}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Download My Data'}
      </button>

      {downloadStatus && <p className='download-status'>{downloadStatus}</p>}
    </>
  )
}

export default DownloadMyData
