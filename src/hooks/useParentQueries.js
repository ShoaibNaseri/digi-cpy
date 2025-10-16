import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getChildrenProfiles,
  createChildrenAccount,
  updateChildrenProfiles,
  deleteChildrenProfiles,
  softDeleteChildProfile
} from '@/services/parentService'
import { getSubscriptionByUserId } from '@/services/paymentService'
import { toast } from 'sonner'

// Query keys for parent-related queries
export const parentQueryKeys = {
  all: ['parent'],
  children: (parentId) => [...parentQueryKeys.all, 'children', parentId],
  subscription: (userId) => [...parentQueryKeys.all, 'subscription', userId]
}

/**
 * Hook to fetch children profiles
 * @param {string} parentId - Parent user ID
 * @param {boolean} enabled - Whether the query should be enabled
 */
export const useChildrenProfiles = (parentId, enabled = true) => {
  return useQuery({
    queryKey: parentQueryKeys.children(parentId),
    queryFn: async () => {
      if (!parentId) return []
      const childrenData = await getChildrenProfiles(parentId)
      return childrenData || []
    },
    enabled: enabled && !!parentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

/**
 * Hook to fetch subscription data
 * @param {string} userId - User ID
 * @param {boolean} enabled - Whether the query should be enabled
 */
export const useSubscription = (userId, enabled = true) => {
  return useQuery({
    queryKey: parentQueryKeys.subscription(userId),
    queryFn: async () => {
      if (!userId) return 'basic'

      const result = await getSubscriptionByUserId(userId)
      if (result.success && result.activeSubscription) {
        return result.activeSubscription
      }
      return 'basic' // Default to basic plan
    },
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  })
}

/**
 * Hook to add a new child
 */
export const useAddChild = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ parentId, children }) => {
      return await createChildrenAccount({ parentId, children })
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch children profiles
      queryClient.invalidateQueries({
        queryKey: parentQueryKeys.children(variables.parentId)
      })
      toast.success('Child profile added successfully')
    },
    onError: (error) => {
      console.error('Error adding child:', error)
      toast.error('Failed to add child profile')
    }
  })
}

/**
 * Hook to update children profiles
 */
export const useUpdateChildren = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ parentId, children }) => {
      return await updateChildrenProfiles(parentId, children)
    },
    onSuccess: (data, variables) => {
      // Update the cache directly for immediate UI update
      queryClient.setQueryData(
        parentQueryKeys.children(variables.parentId),
        variables.children
      )
      toast.success('Child profile updated successfully')
    },
    onError: (error) => {
      console.error('Error updating child:', error)
      toast.error('Failed to update child profile')
    }
  })
}

/**
 * Hook to soft delete a child
 */
export const useDeleteChild = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ parentId, childId }) => {
      return await softDeleteChildProfile(parentId, childId)
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch children profiles to get updated list
      queryClient.invalidateQueries({
        queryKey: parentQueryKeys.children(variables.parentId)
      })
      toast.success('Child profile deleted successfully')
    },
    onError: (error) => {
      console.error('Error deleting child:', error)
      toast.error('Failed to delete child profile')
    }
  })
}
