import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchMissionsAndClasses,
  deleteMission as deleteMissionService,
  updateMission as updateMissionService
} from '@/services/teacher/missionService'

// Query keys for mission-related queries
export const missionQueryKeys = {
  all: ['missions'],
  missionsAndClasses: (userId, schoolId, selectedClass, selectedMenu) => [
    ...missionQueryKeys.all,
    'missionsAndClasses',
    userId,
    schoolId,
    selectedClass,
    selectedMenu
  ]
}

/**
 * Hook to fetch missions and classes for teacher planner
 * @param {string} userId - Teacher user ID
 * @param {string} schoolId - School ID
 * @param {string} selectedClass - Selected class filter
 * @param {string} selectedMenu - Selected mission type filter
 * @param {boolean} enabled - Whether the query should be enabled
 */
export const useMissionsAndClasses = (
  userId,
  schoolId,
  selectedClass,
  selectedMenu,
  enabled = true
) => {
  return useQuery({
    queryKey: missionQueryKeys.missionsAndClasses(
      userId,
      schoolId,
      selectedClass,
      selectedMenu
    ),
    queryFn: () =>
      fetchMissionsAndClasses(userId, schoolId, selectedClass, selectedMenu),
    enabled: enabled && !!userId && !!schoolId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

/**
 * Hook to delete a mission
 * @returns {Object} - Mutation object with mutate function
 */
export const useDeleteMission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ missionId, userId }) =>
      deleteMissionService(missionId, userId),
    onSuccess: (data, variables) => {
      // Invalidate all mission queries to refetch data
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.all })
    },
    onError: (error) => {
      console.error('Error deleting mission:', error)
    }
  })
}

/**
 * Hook to update a mission
 * @returns {Object} - Mutation object with mutate function
 */
export const useUpdateMission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updatedMission) => updateMissionService(updatedMission),
    onSuccess: (data, variables) => {
      // Invalidate all mission queries to refetch data
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.all })
    },
    onError: (error) => {
      console.error('Error updating mission:', error)
    }
  })
}
