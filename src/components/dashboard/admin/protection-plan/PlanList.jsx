import React, { useState, useEffect, useCallback } from 'react'
import PlanCard from './PlanCard'
import './PlanList.css'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { myProtectionPlanService } from '@/services/myProtectionPlanService'

const PLANS_PER_PAGE = 6

const PlanList = ({ searchQuery, statusFilter }) => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSnapshots, setPageSnapshots] = useState({})
  const [allPlans, setAllPlans] = useState([])
  const [isFiltering, setIsFiltering] = useState(false)

  const fetchAllPlans = async () => {
    try {
      setLoading(true)
      const fetchedPlans = await myProtectionPlanService.getAllAdminPlans()
      setAllPlans(fetchedPlans)
      return fetchedPlans
    } catch (error) {
      console.error('Error fetching all plans:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Progressive pagination builder for jumping to pages
  const buildSnapshotsToPage = async (targetPage) => {
    try {
      setLoading(true)
      let currentPageBuilder = 1
      let lastVisibleDoc = null

      // Build snapshots progressively from page 1 to target page
      while (currentPageBuilder <= targetPage) {
        const result = await myProtectionPlanService.getAdminPlansByPage(
          currentPageBuilder,
          currentPageBuilder === 1 ? null : lastVisibleDoc
        )

        setPageSnapshots((prev) => ({
          ...prev,
          [currentPageBuilder]: result.lastVisible
        }))

        lastVisibleDoc = result.lastVisible

        // If we reached the target page, set the plans
        if (currentPageBuilder === targetPage) {
          setPlans(result.plans)
          setCurrentPage(targetPage)
        }

        currentPageBuilder++
      }
    } catch (error) {
      console.error('Error building snapshots to page:', error)
    } finally {
      setLoading(false)
    }
  }

  // Client-side pagination using allPlans
  const paginateFromAllPlans = (page) => {
    const startIndex = (page - 1) * PLANS_PER_PAGE
    const endIndex = startIndex + PLANS_PER_PAGE
    const paginatedPlans = allPlans.slice(startIndex, endIndex)

    setPlans(paginatedPlans)
    setCurrentPage(page)
    setLoading(false)
  }

  const fetchPlans = async (page) => {
    try {
      setLoading(true)
      const result = await myProtectionPlanService.getAdminPlansByPage(
        page,
        page === 1 ? null : pageSnapshots[page - 1]
      )

      setPageSnapshots((prev) => ({
        ...prev,
        [page]: result.lastVisible
      }))

      setPlans(result.plans)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPage = async (page) => {
    if (page < 1 || page > totalPages) return

    // If we have all plans loaded, use client-side pagination
    if (allPlans.length > 0 && !isFiltering) {
      paginateFromAllPlans(page)
      return
    }

    // If jumping to a page and we don't have the required snapshot
    if (page !== 1 && !pageSnapshots[page - 1]) {
      // Check if we can build snapshots progressively (for smaller jumps)
      const missingPages =
        page - Math.max(...Object.keys(pageSnapshots).map(Number), 0) - 1

      if (missingPages <= 3) {
        // For small jumps, build snapshots progressively
        await buildSnapshotsToPage(page)
      } else {
        // For large jumps, fetch all plans and use client-side pagination
        const fetchedPlans =
          allPlans.length > 0 ? allPlans : await fetchAllPlans()
        if (fetchedPlans.length > 0) {
          paginateFromAllPlans(page)
        } else {
          // Fallback to page 1 if all else fails
          await fetchPlans(1)
        }
      }
      return
    }

    // Normal pagination flow
    await fetchPlans(page)
  }

  const filterPlans = useCallback(async () => {
    if (!searchQuery && statusFilter === 'all') {
      setIsFiltering(false)
      await fetchPage(1)
      return
    }

    setIsFiltering(true)
    const plansToSearch = allPlans.length > 0 ? allPlans : await fetchAllPlans()
    const filtered = myProtectionPlanService.filterPlans(
      plansToSearch,
      searchQuery,
      statusFilter
    )
    setPlans(filtered)
  }, [searchQuery, statusFilter, allPlans])

  useEffect(() => {
    const initializePagination = async () => {
      const total = await myProtectionPlanService.getAdminTotalPages()
      setTotalPages(total)
      fetchPage(1)
    }

    initializePagination()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      filterPlans()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, statusFilter, filterPlans])

  if (loading && plans.length === 0) {
    return <div className='plan-loading'>Loading plans...</div>
  }

  return (
    <div className='plan-list-container'>
      <div className='plan-grid'>
        {plans.map((plan) => (
          <PlanCard key={plan.id} data={plan} date={plan.createdAt} />
        ))}
      </div>

      {!isFiltering && (
        <div className='plan-pagination'>
          <button
            className='plan-pagination-button'
            onClick={() => fetchPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaArrowLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`plan-pagination-button ${
                currentPage === page ? 'active' : ''
              }`}
              onClick={() => fetchPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className='plan-pagination-button'
            onClick={() => fetchPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaArrowRight />
          </button>
        </div>
      )}
    </div>
  )
}

export default PlanList
