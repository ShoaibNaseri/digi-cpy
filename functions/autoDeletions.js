const { onSchedule } = require('firebase-functions/v2/scheduler')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { logger } = require('firebase-functions')
const admin = require('firebase-admin')

/**
 * Auto-deletion function that runs every 24 hours
 * Permanently deletes accounts that have been soft deleted and passed their willBeDeleted date
 */
exports.autoDeleteExpiredAccounts = onSchedule(
  {
    schedule: 'every day 02:38', // Run every day at 02:07 (10 minutes from current time)
    timeZone: 'Asia/Kabul', // Iran timezone
    memory: '1GiB',
    timeoutSeconds: 540
  },
  async (event) => {
    logger.info('Starting auto-deletion process for expired accounts')

    try {
      const db = admin.firestore()
      const batch = db.batch()
      let deletedCount = 0
      let errorCount = 0

      // Get current timestamp
      const now = new Date()

      // Query all profiles that have children
      const profilesSnapshot = await db.collection('profiles').get()

      for (const profileDoc of profilesSnapshot.docs) {
        try {
          const profileData = profileDoc.data()
          const children = profileData.children || []

          if (!Array.isArray(children) || children.length === 0) {
            continue
          }

          // Filter children that are soft deleted and past their deletion date
          const expiredChildren = children.filter((child) => {
            return (
              child.isDeleted === true &&
              child.willBeDeleted &&
              new Date(child.willBeDeleted) <= now
            )
          })

          if (expiredChildren.length === 0) {
            continue
          }

          // Remove expired children from the array
          const remainingChildren = children.filter((child) => {
            return !(
              child.isDeleted === true &&
              child.willBeDeleted &&
              new Date(child.willBeDeleted) <= now
            )
          })

          // Update the profile with remaining children
          batch.update(profileDoc.ref, {
            children: remainingChildren,
            lastAutoCleanup: admin.firestore.FieldValue.serverTimestamp()
          })

          // Note: Not updating parent's user document to keep tracking data for records

          deletedCount += expiredChildren.length

          logger.info(
            `Profile ${profileDoc.id}: Removing ${expiredChildren.length} expired children`,
            {
              expiredChildren: expiredChildren.map((child) => ({
                childId: child.childId,
                deletedAt: child.deletedAt,
                willBeDeleted: child.willBeDeleted
              }))
            }
          )
        } catch (profileError) {
          errorCount++
          logger.error(
            `Error processing profile ${profileDoc.id}:`,
            profileError
          )
        }
      }

      // Commit all batch operations
      if (deletedCount > 0) {
        await batch.commit()
        logger.info(
          `Auto-deletion completed successfully. Deleted ${deletedCount} expired accounts.`
        )
      } else {
        logger.info('Auto-deletion completed. No expired accounts found.')
      }

      // Log summary
      logger.info('Auto-deletion process completed', {
        deletedCount,
        errorCount,
        processedProfiles: profilesSnapshot.size
      })
    } catch (error) {
      logger.error('Auto-deletion process failed:', error)
      throw error
    }
  }
)

/**
 * Function to manually trigger auto-deletion (for testing)
 * Can be called via HTTP or from admin panel
 */
exports.manualAutoDelete = onDocumentCreated(
  {
    document: 'admin/triggers/autoDelete',
    region: 'us-central1'
  },
  async (event) => {
    logger.info('Manual auto-deletion triggered')

    try {
      // Call the same logic as the scheduled function
      const db = admin.firestore()
      const batch = db.batch()
      let deletedCount = 0
      let errorCount = 0

      const now = new Date()
      const profilesSnapshot = await db.collection('profiles').get()

      for (const profileDoc of profilesSnapshot.docs) {
        try {
          const profileData = profileDoc.data()
          const children = profileData.children || []

          if (!Array.isArray(children) || children.length === 0) {
            continue
          }

          const expiredChildren = children.filter((child) => {
            return (
              child.isDeleted === true &&
              child.willBeDeleted &&
              new Date(child.willBeDeleted) <= now
            )
          })

          if (expiredChildren.length === 0) {
            continue
          }

          const remainingChildren = children.filter((child) => {
            return !(
              child.isDeleted === true &&
              child.willBeDeleted &&
              new Date(child.willBeDeleted) <= now
            )
          })

          batch.update(profileDoc.ref, {
            children: remainingChildren,
            lastManualCleanup: admin.firestore.FieldValue.serverTimestamp()
          })

          // Note: Not updating parent's user document to keep tracking data for records

          deletedCount += expiredChildren.length
        } catch (profileError) {
          errorCount++
          logger.error(
            `Error processing profile ${profileDoc.id}:`,
            profileError
          )
        }
      }

      if (deletedCount > 0) {
        await batch.commit()
      }

      logger.info(
        `Manual auto-deletion completed. Deleted ${deletedCount} expired accounts.`
      )
    } catch (error) {
      logger.error('Manual auto-deletion failed:', error)
      throw error
    }
  }
)

/**
 * Function to get cleanup statistics
 * Returns information about soft-deleted accounts and their deletion dates
 */
exports.getCleanupStats = require('firebase-functions').https.onCall(
  async (data, context) => {
    // Check if user is authenticated and has admin privileges
    if (!context.auth) {
      throw new Error('Authentication required')
    }

    try {
      const db = admin.firestore()
      const now = new Date()
      const stats = {
        totalProfiles: 0,
        profilesWithDeletedChildren: 0,
        totalDeletedChildren: 0,
        expiredChildren: 0,
        childrenToBeDeleted: []
      }

      const profilesSnapshot = await db.collection('profiles').get()
      stats.totalProfiles = profilesSnapshot.size

      for (const profileDoc of profilesSnapshot.docs) {
        const profileData = profileDoc.data()
        const children = profileData.children || []

        if (!Array.isArray(children) || children.length === 0) {
          continue
        }

        const deletedChildren = children.filter(
          (child) => child.isDeleted === true
        )

        if (deletedChildren.length > 0) {
          stats.profilesWithDeletedChildren++
          stats.totalDeletedChildren += deletedChildren.length

          deletedChildren.forEach((child) => {
            if (child.willBeDeleted) {
              const deletionDate = new Date(child.willBeDeleted)
              const isExpired = deletionDate <= now

              if (isExpired) {
                stats.expiredChildren++
              }

              stats.childrenToBeDeleted.push({
                childId: child.childId,
                parentId: profileDoc.id,
                deletedAt: child.deletedAt,
                willBeDeleted: child.willBeDeleted,
                isExpired,
                daysUntilDeletion: Math.ceil(
                  (deletionDate - now) / (1000 * 60 * 60 * 24)
                )
              })
            }
          })
        }
      }

      return stats
    } catch (error) {
      logger.error('Error getting cleanup stats:', error)
      throw error
    }
  }
)
