// DiscussionDetail.js
import React, { useState, useEffect, useRef } from 'react'
import './DiscussionDetail.css'
import {
  getDiscussion,
  getComments,
  addComment,
  likeDiscussion,
  hasUserLikedDiscussion
} from '@/services/teacher/discussionService'
import { useAuth } from '@/context/AuthContext'
import { formatDistanceToNow } from 'date-fns'

const DiscussionDetail = ({ discussionId, onClose }) => {
  const { currentUser } = useAuth()
  const [discussion, setDiscussion] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const modalRef = useRef(null)

  // Load discussion and comments
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load discussion
        const discussionData = await getDiscussion(discussionId)
        setDiscussion(discussionData)

        // Load comments
        const commentsData = await getComments(discussionId)
        setComments(commentsData)

        // Check if user has liked the discussion
        if (currentUser) {
          const liked = await hasUserLikedDiscussion(
            discussionId,
            currentUser.uid
          )
          setIsLiked(liked)
        }

        setError(null)
      } catch (error) {
        console.error('Error loading discussion details:', error)
        setError('Failed to load discussion. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [discussionId, currentUser])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Handle Escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [onClose])

  // Calculate time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'recently'
    return formatDistanceToNow(timestamp, { addSuffix: true })
  }

  // Handle like button click
  const handleLikeClick = async () => {
    if (!currentUser) {
      alert('Please log in to like discussions')
      return
    }

    setIsLikeLoading(true)

    try {
      const result = await likeDiscussion(discussionId, currentUser.uid)

      setIsLiked(result.liked)

      // Update discussion like count
      setDiscussion((prev) => ({
        ...prev,
        likeCount: result.liked ? prev.likeCount + 1 : prev.likeCount - 1
      }))
    } catch (error) {
      console.error('Error liking discussion:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      alert('Please log in to comment')
      return
    }

    if (!newComment.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Add the comment
      const commentId = await addComment(
        discussionId,
        currentUser.uid,
        newComment
      )

      // Get user data from the current user
      const newCommentObj = {
        id: commentId,
        content: newComment,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
        authorPhotoURL: currentUser.photoURL,
        authorRole: currentUser.role || null,
        createdAt: new Date(),
        likeCount: 0
      }

      // Add new comment to the list
      setComments((prev) => [...prev, newCommentObj])

      // Update discussion comment count
      setDiscussion((prev) => ({
        ...prev,
        commentCount: prev.commentCount + 1
      }))

      // Clear the input
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='dd-overlay'>
        <div className='dd-modal' ref={modalRef}>
          <div className='dd-loading'>Loading discussion...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='dd-overlay'>
        <div className='dd-modal' ref={modalRef}>
          <div className='dd-error'>{error}</div>
          <button className='dd-close-btn' onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className='dd-overlay'>
        <div className='dd-modal' ref={modalRef}>
          <div className='dd-error'>Discussion not found</div>
          <button className='dd-close-btn' onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='dd-overlay'>
      <div className='dd-modal' ref={modalRef}>
        <div className='dd-header'>
          <button className='dd-close-btn' onClick={onClose}>
            &times;
          </button>
          <h2 className='dd-title'>{discussion.title}</h2>
          <div className='dd-meta'>
            <span className='dd-tag'>{discussion.category}</span>
            <span className='dd-author'>
              Posted by{' '}
              {discussion.authorRole
                ? `${discussion.authorRole}`
                : discussion.authorName || 'Anonymous'}
            </span>
            <span className='dd-time'>{getTimeAgo(discussion.createdAt)}</span>
          </div>
        </div>

        <div className='dd-content'>{discussion.content}</div>

        <div className='dd-actions'>
          <button
            className={`dd-like-btn ${isLiked ? 'dd-liked' : ''} ${
              isLikeLoading ? 'dd-loading' : ''
            }`}
            onClick={handleLikeClick}
            disabled={isLikeLoading || !currentUser}
          >
            <span className='dd-like-icon'>{isLiked ? '❤️' : '🤍'}</span>
            <span className='dd-like-count'>{discussion.likeCount}</span>
          </button>
        </div>

        <div className='dd-comments-section'>
          <h3 className='dd-comments-title'>Comments ({comments.length})</h3>

          {comments.length === 0 ? (
            <div className='dd-no-comments'>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className='dd-comments-list'>
              {comments.map((comment) => (
                <div className='dd-comment' key={comment.id}>
                  <div className='dd-comment-header'>
                    <div className='dd-comment-avatar'>
                      <div
                        className='dd-avatar'
                        style={
                          comment.authorPhotoURL
                            ? {
                                backgroundImage: `url(${comment.authorPhotoURL})`
                              }
                            : {}
                        }
                      ></div>
                    </div>
                    <div className='dd-comment-meta'>
                      <span className='dd-comment-author'>
                        {comment.authorRole
                          ? `${comment.authorRole}`
                          : comment.authorName || 'Anonymous'}
                      </span>
                      <span className='dd-comment-time'>
                        {getTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className='dd-comment-content'>{comment.content}</div>
                </div>
              ))}
            </div>
          )}

          <form className='dd-comment-form' onSubmit={handleCommentSubmit}>
            <textarea
              className='dd-comment-input'
              placeholder={
                currentUser
                  ? 'Write your comment here...'
                  : 'Please log in to comment'
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!currentUser || isSubmitting}
            />
            <button
              className='dd-submit-btn'
              type='submit'
              disabled={!currentUser || isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DiscussionDetail
