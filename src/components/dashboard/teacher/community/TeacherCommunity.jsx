// TeacherCommunityForum.js
import React, { useState, useEffect } from 'react'
import './TeacherCommunityForum.css'
import CreateNewDiscussion from './CreateNewDiscussion'
import {
  getDiscussions,
  getTrendingTopics,
  likeDiscussion,
  hasUserLikedDiscussion
} from '@/services/teacher/discussionService'
import { useAuth } from '@/context/AuthContext'
import { formatDistanceToNow } from 'date-fns'

const TeacherCommunityForum = () => {
  const { currentUser } = useAuth()
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false)
  const [discussions, setDiscussions] = useState([])
  const [trendingTopics, setTrendingTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [likeStates, setLikeStates] = useState({})
  const [filters, setFilters] = useState({
    category: 'All Categories',
    searchTerm: ''
  })

  // Fetch discussions and trending topics on component mount
  useEffect(() => {
    loadDiscussions()
    loadTrendingTopics()
  }, [])

  // Reload discussions when filters change
  useEffect(() => {
    loadDiscussions()
  }, [filters])

  const loadDiscussions = async () => {
    try {
      setLoading(true)
      const fetchedDiscussions = await getDiscussions(filters)
      setDiscussions(fetchedDiscussions)

      // Check like status for all discussions if user is logged in
      if (currentUser) {
        const likePromises = fetchedDiscussions.map(async (discussion) => {
          const isLiked = await hasUserLikedDiscussion(
            discussion.id,
            currentUser.uid
          )
          return { discussionId: discussion.id, isLiked }
        })

        const likeResults = await Promise.all(likePromises)
        const newLikeStates = {}

        likeResults.forEach((result) => {
          newLikeStates[result.discussionId] = {
            isLiked: result.isLiked,
            isLoading: false
          }
        })

        setLikeStates(newLikeStates)
      }

      setError(null)
    } catch (error) {
      console.error('Error loading discussions:', error)
      setError('Failed to load discussions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadTrendingTopics = async () => {
    try {
      const topics = await getTrendingTopics()
      setTrendingTopics(topics)
    } catch (error) {
      console.error('Error loading trending topics:', error)
    }
  }

  const handleNewDiscussionClick = () => {
    setShowCreateDiscussion(true)
  }

  const handleCancelDiscussion = () => {
    setShowCreateDiscussion(false)
  }

  const handleSubmitDiscussion = (discussionData) => {
    // Refresh discussions after a new one is created
    loadDiscussions()
    setShowCreateDiscussion(false)
  }

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
  }

  const handleCategoryChange = (e) => {
    setFilters((prev) => ({ ...prev, category: e.target.value }))
  }

  const handleLikeClick = async (discussionId, currentLikeCount) => {
    if (!currentUser) {
      alert('Please log in to like discussions')
      return
    }

    // Set loading state for this specific discussion
    setLikeStates((prev) => ({
      ...prev,
      [discussionId]: {
        ...prev[discussionId],
        isLoading: true
      }
    }))

    try {
      const result = await likeDiscussion(discussionId, currentUser.uid)

      // Update like state for this discussion
      setLikeStates((prev) => ({
        ...prev,
        [discussionId]: {
          isLiked: result.liked,
          isLoading: false
        }
      }))

      // Update discussion like count in the discussions array
      setDiscussions((prev) =>
        prev.map((discussion) => {
          if (discussion.id === discussionId) {
            return {
              ...discussion,
              likeCount: result.liked
                ? discussion.likeCount + 1
                : discussion.likeCount - 1
            }
          }
          return discussion
        })
      )
    } catch (error) {
      console.error('Error liking discussion:', error)

      // Reset loading state
      setLikeStates((prev) => ({
        ...prev,
        [discussionId]: {
          ...prev[discussionId],
          isLoading: false
        }
      }))
    }
  }

  // Calculate the time since the post was created
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'recently'
    return formatDistanceToNow(timestamp, { addSuffix: true })
  }

  // If showing create discussion page, render that instead
  if (showCreateDiscussion) {
    return (
      <CreateNewDiscussion
        onCancel={handleCancelDiscussion}
        onSubmit={handleSubmitDiscussion}
      />
    )
  }

  // Otherwise render the forum main page
  return (
    <div className='tcf-container'>
      <div className='tcf-header'>
        <h1 className='tcf-title'>Teacher Community Forum</h1>
        <p className='tcf-subtitle'>
          Connect, share, and learn from fellow educators
        </p>
      </div>

      <div className='tcf-controls'>
        <button
          className='tcf-new-discussion-btn'
          onClick={handleNewDiscussionClick}
          disabled={!currentUser}
        >
          <span className='tcf-plus-icon'>+</span> New Discussion
        </button>
        <div className='tcf-search-filter'>
          <div className='tcf-search-container'>
            <div className='tcf-search-icon-placeholder'></div>
            <input
              type='text'
              className='tcf-search-input'
              placeholder='Search discussions...'
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className='tcf-dropdown-container'>
            <select
              className='tcf-category-dropdown'
              value={filters.category}
              onChange={handleCategoryChange}
            >
              <option>All Categories</option>
              <option>Teaching Tips</option>
              <option>Resources</option>
              <option>EdTech</option>
              <option>Remote Learning</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className='tcf-error-message'>{error}</div>}

      {loading ? (
        <div className='tcf-loading'>Loading discussions...</div>
      ) : (
        <div className='tcf-discussions'>
          {discussions.length === 0 ? (
            <div className='tcf-no-discussions'>
              No discussions found. Be the first to start a conversation!
            </div>
          ) : (
            discussions.map((discussion) => (
              <div className='tcf-discussion-card' key={discussion.id}>
                <div className='tcf-avatar-container'>
                  <div
                    className='tcf-avatar'
                    style={
                      discussion.authorPhotoURL
                        ? {
                            backgroundImage: `url(${discussion.authorPhotoURL})`
                          }
                        : {}
                    }
                  ></div>
                </div>
                <div className='tcf-discussion-content'>
                  <h3 className='tcf-discussion-title'>{discussion.title}</h3>
                  <div className='tcf-discussion-meta'>
                    <span className='tcf-tag'>{discussion.category}</span>
                    <span className='tcf-post-info'>
                      Posted by{' '}
                      {discussion.authorRole
                        ? `${discussion.authorRole}`
                        : discussion.authorName || 'Anonymous'}
                    </span>
                    <span className='tcf-post-time'>
                      {getTimeAgo(discussion.createdAt)}
                    </span>
                  </div>
                </div>
                <div className='tcf-discussion-stats'>
                  <div className='tcf-comments'>
                    <span className='tcf-comment-count'>
                      {discussion.commentCount}
                    </span>
                  </div>
                  <button
                    className={`tcf-like-button ${
                      likeStates[discussion.id]?.isLiked ? 'tcf-liked' : ''
                    } ${
                      likeStates[discussion.id]?.isLoading ? 'tcf-loading' : ''
                    }`}
                    onClick={() =>
                      handleLikeClick(discussion.id, discussion.likeCount)
                    }
                    disabled={
                      likeStates[discussion.id]?.isLoading || !currentUser
                    }
                  >
                    <span className='tcf-like-icon'>
                      {likeStates[discussion.id]?.isLiked ? '❤️' : '🤍'}
                    </span>
                    <span className='tcf-like-count'>
                      {discussion.likeCount}
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className='tcf-trending-section'>
        <h2 className='tcf-trending-title'>Trending Topics</h2>
        <div className='tcf-trending-topics'>
          {trendingTopics.length === 0 ? (
            <div className='tcf-no-trending'>No trending topics yet.</div>
          ) : (
            trendingTopics.map((topic, index) => (
              <div className='tcf-trending-topic' key={index}>
                <span className='tcf-hashtag'>#{topic.tag}</span>
                <span className='tcf-post-count'>{topic.count} posts</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherCommunityForum
