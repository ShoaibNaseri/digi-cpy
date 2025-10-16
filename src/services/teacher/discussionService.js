// discussionService.js
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  getDoc,
  doc,
  updateDoc,
  increment,
  deleteDoc,
  setDoc
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export const getDiscussions = async (filters = {}) => {
  try {
    const { category = 'All Categories', searchTerm = '' } = filters

    let discussionsQuery = query(
      collection(db, 'discussions'),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(discussionsQuery)

    let discussions = []

    const discussionPromises = []
    querySnapshot.forEach((docSnapshot) => {
      const discussionData = docSnapshot.data()
      const discussionId = docSnapshot.id

      const processDiscussion = async () => {
        let authorRole = discussionData.authorRole

        if (!authorRole && discussionData.authorId) {
          try {
            const userDocRef = doc(db, 'users', discussionData.authorId)
            const userDoc = await getDoc(userDocRef)

            if (userDoc.exists()) {
              const userData = userDoc.data()
              authorRole = userData.role

              await updateDoc(doc(db, 'discussions', discussionId), {
                authorRole: authorRole
              })
            }
          } catch (e) {
            console.error('Error fetching user data:', e)
          }
        }

        return {
          id: discussionId,
          ...discussionData,
          authorRole: authorRole,
          createdAt: discussionData.createdAt?.toDate()
        }
      }

      discussionPromises.push(processDiscussion())
    })

    discussions = await Promise.all(discussionPromises)

    if (category && category !== 'All Categories') {
      discussions = discussions.filter(
        (discussion) => discussion.category === category
      )
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      discussions = discussions.filter((discussion) =>
        discussion.title.toLowerCase().includes(lowerSearchTerm)
      )
    }

    console.log('Processed discussions with author roles:', discussions)
    return discussions
  } catch (error) {
    console.error('Error fetching discussions:', error)
    throw error
  }
}

export const getTrendingTopics = async () => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'discussions'),
        orderBy('createdAt', 'desc'),
        limit(20)
      )
    )

    const tagCounts = {}
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.tags) {
        const tagsArray = data.tags.split(',').map((tag) => tag.trim())
        tagsArray.forEach((tag) => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          }
        })
      }
    })

    const trendingTopics = Object.keys(tagCounts)
      .map((tag) => ({
        tag,
        count: tagCounts[tag]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return trendingTopics
  } catch (error) {
    console.error('Error fetching trending topics:', error)
    throw error
  }
}

export const createDiscussion = async (discussionData, userId) => {
  try {
    const { title, category, content, tags } = discussionData

    const userDoc = await getDoc(doc(db, 'users', userId))
    const userData = userDoc.data()

    const discussionRef = await addDoc(collection(db, 'discussions'), {
      title,
      category,
      content,
      tags,
      authorId: userId,
      authorName: userData?.displayName || 'Anonymous User',
      authorPhotoURL: userData?.photoURL || null,
      authorRole: userData?.role || 'GUEST',
      createdAt: serverTimestamp(),
      likeCount: 0,
      commentCount: 0
    })

    return discussionRef.id
  } catch (error) {
    console.error('Error creating discussion:', error)
    throw error
  }
}

export const likeDiscussion = async (discussionId, userId) => {
  try {
    const likeRef = doc(db, 'likes', `${discussionId}_${userId}`)
    const likeDoc = await getDoc(likeRef)

    const discussionRef = doc(db, 'discussions', discussionId)

    if (likeDoc.exists()) {
      await deleteDoc(likeRef)

      await updateDoc(discussionRef, {
        likeCount: increment(-1)
      })

      return { liked: false }
    } else {
      await setDoc(likeRef, {
        userId,
        discussionId,
        createdAt: serverTimestamp()
      })

      await updateDoc(discussionRef, {
        likeCount: increment(1)
      })

      return { liked: true }
    }
  } catch (error) {
    console.error('Error liking/unliking discussion:', error)
    throw error
  }
}

export const hasUserLikedDiscussion = async (discussionId, userId) => {
  try {
    const likeRef = doc(db, 'likes', `${discussionId}_${userId}`)
    const likeDoc = await getDoc(likeRef)
    return likeDoc.exists()
  } catch (error) {
    console.error('Error checking if user liked discussion:', error)
    throw error
  }
}

export const getDiscussion = async (discussionId) => {
  try {
    const discussionDoc = await getDoc(doc(db, 'discussions', discussionId))

    if (!discussionDoc.exists()) {
      throw new Error('Discussion not found')
    }

    const data = discussionDoc.data()

    let authorRole = data.authorRole
    if (!authorRole && data.authorId) {
      try {
        const userDocRef = doc(db, 'users', data.authorId)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          authorRole = userData.role

          await updateDoc(doc(db, 'discussions', discussionId), {
            authorRole: authorRole
          })
        }
      } catch (e) {
        console.error('Error fetching user data:', e)
      }
    }

    return {
      id: discussionDoc.id,
      ...data,
      authorRole: authorRole,
      createdAt: data.createdAt?.toDate()
    }
  } catch (error) {
    console.error('Error fetching discussion:', error)
    throw error
  }
}

export const getComments = async (discussionId) => {
  try {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('discussionId', '==', discussionId),
      orderBy('createdAt', 'asc')
    )

    const querySnapshot = await getDocs(commentsQuery)

    const commentsPromises = []

    querySnapshot.forEach((docSnapshot) => {
      const commentData = docSnapshot.data()
      const commentId = docSnapshot.id

      const processComment = async () => {
        let authorRole = commentData.authorRole

        if (!authorRole && commentData.authorId) {
          try {
            const userDocRef = doc(db, 'users', commentData.authorId)
            const userDoc = await getDoc(userDocRef)

            if (userDoc.exists()) {
              const userData = userDoc.data()
              authorRole = userData.role

              await updateDoc(doc(db, 'comments', commentId), {
                authorRole: authorRole
              })
            }
          } catch (e) {
            console.error('Error fetching user data for comment:', e)
          }
        }

        return {
          id: commentId,
          ...commentData,
          authorRole: authorRole,
          createdAt: commentData.createdAt?.toDate()
        }
      }

      commentsPromises.push(processComment())
    })

    const comments = await Promise.all(commentsPromises)
    return comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    throw error
  }
}

export const addComment = async (discussionId, userId, content) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userData = userDoc.data()

    const commentRef = await addDoc(collection(db, 'comments'), {
      discussionId,
      authorId: userId,
      authorName: userData?.displayName || 'Anonymous User',
      authorPhotoURL: userData?.photoURL || null,
      authorRole: userData?.role || null,
      content,
      createdAt: serverTimestamp(),
      likeCount: 0
    })

    const discussionRef = doc(db, 'discussions', discussionId)
    await updateDoc(discussionRef, {
      commentCount: increment(1)
    })

    return commentRef.id
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

export const likeComment = async (commentId, userId) => {
  try {
    const likeRef = doc(db, 'commentLikes', `${commentId}_${userId}`)
    const likeDoc = await getDoc(likeRef)

    const commentRef = doc(db, 'comments', commentId)

    if (likeDoc.exists()) {
      await deleteDoc(likeRef)

      await updateDoc(commentRef, {
        likeCount: increment(-1)
      })

      return { liked: false }
    } else {
      await setDoc(likeRef, {
        userId,
        commentId,
        createdAt: serverTimestamp()
      })

      await updateDoc(commentRef, {
        likeCount: increment(1)
      })

      return { liked: true }
    }
  } catch (error) {
    console.error('Error liking/unliking comment:', error)
    throw error
  }
}

export const hasUserLikedComment = async (commentId, userId) => {
  try {
    const likeRef = doc(db, 'commentLikes', `${commentId}_${userId}`)
    const likeDoc = await getDoc(likeRef)
    return likeDoc.exists()
  } catch (error) {
    console.error('Error checking if user liked comment:', error)
    throw error
  }
}

export const getUserDiscussions = async (userId) => {
  try {
    const discussionsQuery = query(
      collection(db, 'discussions'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(discussionsQuery)

    const discussions = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      discussions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()
      })
    })

    return discussions
  } catch (error) {
    console.error('Error fetching user discussions:', error)
    throw error
  }
}

export const deleteDiscussion = async (discussionId) => {
  try {
    await deleteDoc(doc(db, 'discussions', discussionId))

    const commentsQuery = query(
      collection(db, 'comments'),
      where('discussionId', '==', discussionId)
    )

    const commentsSnapshot = await getDocs(commentsQuery)
    const commentDeletions = []

    commentsSnapshot.forEach((commentDoc) => {
      commentDeletions.push(deleteDoc(doc(db, 'comments', commentDoc.id)))
    })

    await Promise.all(commentDeletions)

    return true
  } catch (error) {
    console.error('Error deleting discussion:', error)
    throw error
  }
}

export const updateDiscussion = async (discussionId, updateData) => {
  try {
    const discussionRef = doc(db, 'discussions', discussionId)

    await updateDoc(discussionRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error updating discussion:', error)
    throw error
  }
}
