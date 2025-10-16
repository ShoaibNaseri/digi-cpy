import mission1Data from '@/assets/game/missions/mission_one/mission_one_db.json'
import mission2Data from '@/assets/game/missions/mission_2/mission_2_db.json'
import mission3Data from '@/assets/game/missions/mission_3/mission_3_db.json'
import mission4Data from '@/assets/game/missions/mission_4/mission_4_db.json'

/**
 * Check if mission data exists for a given mission ID
 * @param {number|string} missionId - The ID of the mission to check
 * @returns {object|null} - Returns mission data if found, null if not found
 */
export const getMissionData = (missionId) => {
  // Convert to number to handle both string and number inputs
  const numericMissionId = parseInt(missionId)

  if (numericMissionId === 1) {
    return mission1Data
  } else if (numericMissionId === 2) {
    return mission2Data
  } else if (numericMissionId === 3) {
    return mission3Data
  } else if (numericMissionId === 4) {
    return mission4Data
  }
  return null
}

/**
 * Validate if a mission exists and is available
 * @param {number|string} missionId - The ID of the mission to validate
 * @returns {boolean} - Returns true if mission exists, false otherwise
 */
export const isMissionAvailable = (missionId) => {
  const missionData = getMissionData(missionId)
  return missionData !== null && missionData !== undefined
}

/**
 * Get mission title by ID from the mission data
 * @param {number|string} missionId - The ID of the mission
 * @returns {string|null} - Returns mission title if found, null otherwise
 */
export const getMissionTitle = (missionId) => {
  const missionData = getMissionData(missionId)
  return missionData ? missionData.title : null
}

/**
 * Handle mission navigation with validation
 * @param {number|string} missionId - Mission ID
 * @param {string} missionTitle - Mission title
 * @param {string} userId - User/Child ID
 * @param {string} userType - Type of user ('student' or 'child')
 * @returns {boolean} - Returns true if navigation was successful, false if mission not found
 */
export const handleMissionNavigation = (
  missionId,
  missionTitle,
  userId,
  userType = 'student'
) => {
  const missionData = getMissionData(missionId)

  if (!missionData) {
    throw new Error(`Mission ${missionId} not found`)
  }

  // Store mission context for the game
  const missionContext = {
    missionId,
    missionTitle,
    userId,
    userType,
    timestamp: Date.now()
  }
  localStorage.setItem('currentMissionContext', JSON.stringify(missionContext))

  // Navigate based on user type
  const basePath =
    userType === 'child' ? '/dashboard/child' : '/dashboard/student'
  window.location.href = `${basePath}/game/mission/${missionId}`

  return true
}
