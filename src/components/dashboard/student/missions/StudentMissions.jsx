import { useState, useEffect } from 'react'
import StudentMissionCard from './StudentMissionCard'
import './StudentMissions.css'

import { useNavigate } from 'react-router-dom'
import MissionNotFoundModal from '@/components/game/MissionNotFoundModal'
import { handleMissionNavigation } from '@/utils/missionUtils'
import { useAuth } from '@/context/AuthContext'
import {
  getMissionProgress,
  getStudentMissionsProgress,
  getMissionAnalytics
} from '@/services/gameMissionProgress'
import { getAllMissions } from '@/utils/jsnMissions'
import PageHeader from '../../../common/dashboard-header/common/PageHeader'
import useStudentMenuItems from '@/hooks/useStudentMenuItems.jsx'

const StudentMissions = () => {
  const [selectedMission, setSelectedMission] = useState(null)
  const [showMissionNotFoundModal, setShowMissionNotFoundModal] =
    useState(false)
  const [attemptedMission, setAttemptedMission] = useState(null)
  const [studentMissionsProgress, setStudentMissionsProgress] = useState({})
  const [missionAnalytics, setMissionAnalytics] = useState({})
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const menuItems = useStudentMenuItems()
  const missionsList = getAllMissions()

  const handleMissionClick = (mission) => {
    setSelectedMission(mission)

    // if (mission.isLocked) {
    //   setShowMissionNotFoundModal(true)
    //   setSelectedMission(null)
    //   return
    // }

    // // Check if mission is locked
    // if (isMissionLocked(mission.id)) {
    //   setAttemptedMission(mission)
    //   setShowMissionNotFoundModal(true)
    //   setSelectedMission(null)
    //   return
    // }

    // if (!currentUser?.uid) {
    //   console.error('User not authenticated')
    //   return
    // }

    try {
      handleMissionNavigation(
        mission.id,
        mission.title,
        currentUser.uid,
        'student'
      )
    } catch (error) {
      console.error('Navigation error:', error)
      setAttemptedMission(mission)
      setShowMissionNotFoundModal(true)
    }

    // Reset selection after handling
    setSelectedMission(null)
  }

  // useEffect(() => {
  //   const fetchProgress = async () => {
  //     try {
  //       const progress = await getStudentMissionsProgress()
  //       // Convert array to object by missionId if needed
  //       const progressById = {}
  //       progress.forEach((item) => {
  //         progressById[item.missionId] = item
  //       })
  //       setStudentMissionsProgress(progressById)

  //       // Fetch analytics for each mission that has progress
  //       const analyticsData = {}
  //       for (const item of progress) {
  //         if (item.missionId) {
  //           try {
  //             const analytics = await getMissionAnalytics(item.missionId)
  //             analyticsData[item.missionId] = analytics
  //           } catch (error) {
  //             console.error(
  //               `Error fetching analytics for mission ${item.missionId}:`,
  //               error
  //             )
  //           }
  //         }
  //       }
  //       setMissionAnalytics(analyticsData)
  //     } catch (error) {
  //       console.error('Error fetching mission progress:', error)
  //     }
  //   }

  //   fetchProgress()
  // }, [])

  const handleCloseModal = () => {
    setShowMissionNotFoundModal(false)
    setAttemptedMission(null)
    setSelectedMission(null)
  }

  // Check if a specific mission is completed
  const isMissionCompleted = (missionId) => {
    // const missionProgress = studentMissionsProgress[missionId]
    // return missionProgress && missionProgress.isComplete === true
    console.log('isMissionCompleted called with:', missionId)
    return true
  }

  // Determine if a mission should be locked
  const isMissionLocked = (missionId) => {
    // First mission is never locked
    if (missionId === 1) return false

    // For other missions, check if the previous mission is completed
    const previousMissionId = missionId - 1
    return !isMissionCompleted(previousMissionId)
  }

  // Format time duration for display
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return '0m'
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  return (
    <div className='missions'>
      <PageHeader
        title='Missions'
        subtitle='Complete missions to earn rewards and level up'
        menuItems={menuItems}
      />
      <div className='missions__list'>
        {missionsList.map((mission) => {
          const progress = studentMissionsProgress[mission.id]
          const analytics = missionAnalytics[mission.id]
          const discription = mission.discription

          return (
            <StudentMissionCard
              key={mission.id}
              title={mission.title}
              icon={mission.icon}
              missionProgress={progress}
              analytics={analytics}
              isSelected={selectedMission?.id === mission.id}
              isLocked={isMissionLocked(mission.id)}
              onClick={() => handleMissionClick(mission)}
              formatDuration={formatDuration}
              discription={discription}
            />
          )
        })}
      </div>

      <MissionNotFoundModal
        isOpen={showMissionNotFoundModal}
        onClose={handleCloseModal}
        missionTitle={attemptedMission?.title}
      />
    </div>
  )
}

export default StudentMissions
