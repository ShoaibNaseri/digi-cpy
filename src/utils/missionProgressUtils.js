import { saveMissionProgress } from '@/services/gameMissionProgress'
import { saveChildMissionProgress } from '@/services/childMissionProgress'

/**
 * Save mission progress for either student or child based on mission context
 * @param {Object} missionData - Mission progress data to save
 */
export const saveMissionProgressUniversal = async (missionData) => {
  // try {
  //   // Get mission context from localStorage
  //   const contextData = localStorage.getItem('currentMissionContext')

  //   if (contextData) {
  //     const missionContext = JSON.parse(contextData)

  //     if (missionContext.userType === 'child') {
  //       // Save to child mission progress
  //       await saveChildMissionProgress(missionData, missionContext.userId)
  //       console.log('Child mission progress saved:', missionData)
  //     } else {
  //       // Save to student mission progress (default)
  //       await saveMissionProgress(missionData)
  //       console.log('Student mission progress saved:', missionData)
  //     }
  //   } else {
  //     // Fallback to student progress if no context
  //     await saveMissionProgress(missionData)
  //     console.log('Mission progress saved (fallback to student):', missionData)
  //   }
  // } catch (error) {
  //   console.error('Error saving mission progress:', error)
  //   throw error
  // }
  console.log('saveMissionProgressUniversal called with:', missionData)
}
