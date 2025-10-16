import React, { useState } from 'react'
import './DownloadMyData.css'
import { downloadUserData } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'
import ExportFormatModal from './ExportFormatModal'
import Papa from 'papaparse'
import { HiDownload } from 'react-icons/hi'

const DownloadMyData = () => {
  const { currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')

  const generateTimestamp = () => {
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = now.getUTCDate().toString().padStart(2, '0')
    const hours = now.getUTCHours().toString().padStart(2, '0')
    const minutes = now.getUTCMinutes().toString().padStart(2, '0')
    const seconds = now.getUTCSeconds().toString().padStart(2, '0')
    return `${year}${month}${day}${hours}${minutes}${seconds}Z`
  }

  const flattenObject = (obj, prefix = '') => {
    const flattened = {}

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}_${key}` : key

      if (value === null || value === undefined) {
        flattened[newKey] = ''
        return
      }
      if (Array.isArray(value)) {
        if (value.length === 0 || typeof value[0] !== 'object') {
          flattened[newKey] = value.join('; ')
        } else {
          value.forEach((item, index) => {
            const itemFlat = flattenObject(item, `${newKey}_${index + 1}`)
            Object.assign(flattened, itemFlat)
          })
        }
        return
      }

      if (typeof value === 'object') {
        if (value instanceof Date) {
          flattened[newKey] = value.toISOString()
        } else if ('seconds' in value && 'nanoseconds' in value) {
          flattened[newKey] = new Date(value.seconds * 1000).toISOString()
        } else {
          Object.assign(flattened, flattenObject(value, newKey))
        }
        return
      }

      flattened[newKey] = value
    })

    return flattened
  }

  const convertToCSV = (data) => {
    try {
      const dataArray = Array.isArray(data) ? data : [data]

      const flattenedData = dataArray.map((item) => flattenObject(item))

      return Papa.unparse(flattenedData, {
        quotes: true,
        header: true,
        skipEmptyLines: true
      })
    } catch (error) {
      console.error('Error converting to CSV:', error)
      throw new Error('Failed to convert data to CSV format')
    }
  }

  const handleExport = async () => {
    try {
      if (!currentUser) {
        setDownloadStatus('Error: User not logged in')
        return
      }

      setIsLoading(true)
      setDownloadStatus('Preparing your data...')

      const userId = currentUser.uid || currentUser.id
      if (!userId) {
        throw new Error('User ID not found')
      }

      const userData = await downloadUserData(userId)
      const timestamp = generateTimestamp()
      const role = currentUser.role || 'user'

      let fileContent, mimeType, fileExtension

      fileContent = JSON.stringify(userData, null, 2)
      mimeType = 'application/json'
      fileExtension = 'json'

      if (exportFormat === 'csv') {
        fileContent = convertToCSV(userData)
        mimeType = 'text/csv'
        fileExtension = 'csv'
      }

      const dataBlob = new Blob([fileContent], { type: mimeType })
      const url = URL.createObjectURL(dataBlob)

      const a = document.createElement('a')
      a.href = url
      a.download = `data_export_${role.toLowerCase()}_${userId}_${timestamp}.${fileExtension}`
      document.body.appendChild(a)
      a.click()

      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDownloadStatus('Download completed!')
      setTimeout(() => setDownloadStatus(''), 3000)
    } catch (error) {
      console.error('Error downloading data:', error)
      setDownloadStatus(`Failed to download data: ${error.message}`)
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <button
        className='download-data-button profile-button'
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
      >
        <HiDownload className="button-icon" />
        {isLoading ? 'Processing...' : 'Download My Data'}
      </button>

      <ExportFormatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleExport}
        selectedFormat={exportFormat}
        setSelectedFormat={setExportFormat}
        isLoading={isLoading}
      />

      {downloadStatus && <p className='download-status'>{downloadStatus}</p>}
    </>
  )
}

export default DownloadMyData
