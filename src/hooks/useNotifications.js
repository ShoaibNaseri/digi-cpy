import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications
} from '@/services/notificationService'

// Query key factory for notifications
export const notificationKeys = {
  all: ['notifications'],
  user: (userId) => [...notificationKeys.all, 'user', userId]
}

/**
 * Hook to fetch user notifications with React Query
 * @param {string} userId - User ID
 * @param {boolean} enabled - Whether the query should be enabled
 */
export const useNotifications = (userId, enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.user(userId),
    queryFn: () => getUserNotifications(userId),
    enabled: enabled && !!userId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

/**
 * Hook to mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}

/**
 * Hook to delete a single notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: (_, notificationId) => {
      // Optimistically update the cache
      queryClient.setQueryData(notificationKeys.all, (oldData) => {
        if (!oldData) return oldData
        return oldData.filter(
          (notification) => notification.id !== notificationId
        )
      })
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}

/**
 * Hook to delete all notifications
 */
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      // Clear all notifications from cache
      queryClient.setQueryData(notificationKeys.all, [])
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notifications) => {
      const unreadNotifications = notifications.filter((n) => !n.read)
      await Promise.all(
        unreadNotifications.map((notification) =>
          markNotificationAsRead(notification.id)
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}
