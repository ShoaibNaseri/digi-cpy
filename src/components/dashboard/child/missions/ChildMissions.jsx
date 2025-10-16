import { useState, useEffect } from 'react'
import './ChildMissions.css'
import StudentMissionCard from '@/components/dashboard/student/missions/StudentMissionCard'
import MissionNotFoundModal from '@/components/game/MissionNotFoundModal'
import { handleMissionNavigation } from '@/utils/missionUtils'
import {
  getChildMissionsProgress,
  getChildMissionAnalytics
} from '@/services/childMissionProgress'
import { getAllMissions } from '@/utils/jsnMissions'
import { useQuery } from '@tanstack/react-query'

const ChildMissions = () => {
  const [childProfile, setChildProfile] = useState(null)
  const [selectedMission, setSelectedMission] = useState(null)
  const [showMissionNotFoundModal, setShowMissionNotFoundModal] =
    useState(false)
  const [attemptedMission, setAttemptedMission] = useState(null)

  // Load child profile from localStorage
  useEffect(() => {
    const selectedProfile = JSON.parse(localStorage.getItem('selectedProfile'))
    setChildProfile(selectedProfile)
  }, [])

  // Fetch missions progress
  const {
    data: childMissionsProgress = {},
    isLoading: progressLoading,
    error: progressError
  } = useQuery({
    queryKey: ['childMissionsProgress', childProfile?.childId],
    queryFn: async () => {
      if (!childProfile?.childId) return {}
      const progress = await getChildMissionsProgress(childProfile.childId)
      const progressById = {}
      progress.forEach((item) => {
        progressById[item.missionId] = item
      })
      return progressById
    },
    enabled: !!childProfile?.childId
  })

  // Fetch analytics for each mission
  const { data: missionAnalytics = {}, isLoading: analyticsLoading } = useQuery(
    {
      queryKey: ['missionAnalytics', childProfile?.childId],
      queryFn: async () => {
        if (!childProfile?.childId) return {}
        const progress = await getChildMissionsProgress(childProfile.childId)
        const analyticsData = {}
        for (const item of progress) {
          try {
            const analytics = await getChildMissionAnalytics(
              item.missionId,
              childProfile.childId
            )
            analyticsData[item.missionId] = analytics
          } catch (err) {
            console.error(
              `Error fetching analytics for mission ${item.missionId}:`,
              err
            )
          }
        }
        return analyticsData
      },
      enabled: !!childProfile?.childId
    }
  )

  const missionsList = getAllMissions()

  const handleMissionClick = (mission) => {
    if (!childProfile?.childId) {
      console.error('Child profile not loaded')
      return
    }

    if (isMissionLocked(mission.id)) {
      setAttemptedMission(mission)
      setShowMissionNotFoundModal(true)
      return
    }

    try {
      handleMissionNavigation(
        mission.id,
        mission.title,
        childProfile.childId,
        'child'
      )
    } catch (error) {
      console.error('Navigation error:', error)
      setAttemptedMission(mission)
      setShowMissionNotFoundModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowMissionNotFoundModal(false)
    setAttemptedMission(null)
    setSelectedMission(null)
  }

  const isMissionCompleted = (missionId) => {
    const missionProgress = childMissionsProgress[missionId]
    return missionProgress && missionProgress.isComplete === true
  }

  const isMissionLocked = (missionId) => {
    if (missionId === 1) return false
    const previousMissionId = missionId - 1
    return !isMissionCompleted(previousMissionId)
  }

  const formatDuration = (milliseconds) => {
    if (!milliseconds) return '0m'
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  if (progressLoading || analyticsLoading) {
    return <div>Loading missions...</div>
  }

  if (progressError) {
    return <div>Error loading missions</div>
  }

  return (
    <div className='missions'>
      <div className='missions__header'>
        <h1 className='missions__title'>Missions</h1>
        <p className='missions__subtitle'>
          Complete missions to earn rewards and level up
        </p>
      </div>

      <div className='missions__list'>
        {missionsList.map((mission) => {
          const progress = childMissionsProgress[mission.id]
          const analytics = missionAnalytics[mission.id]

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

export default ChildMissions
