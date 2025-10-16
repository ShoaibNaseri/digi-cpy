import MyProtectionPlanList from './MyProtectionPlanList'

import { useState } from 'react'
import { useMyProtectionPlan } from '@/context/MyProtectionPlanContext'
import MyProtectionPlanModal from './MyProtectionPlanModal'
import './MyProtectionPlan.css'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useStudentMenuItems from '@/hooks/useStudentMenuItems'
const MyProtectionPlan = () => {
  const [searchQuery, setSearchQuery] = useState('')
  // const [showFilter, setShowFilter] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const { isModalOpen, closeModal, selectedDate } = useMyProtectionPlan()
  const studentMenuItems = useStudentMenuItems()

  return (
    <div className='all-plans'>
      <PageHeader
        title='My Protection Plan'
        subtitle='Manage your protection plan'
        menuItems={studentMenuItems}
      />
      <MyProtectionPlanList
        searchQuery={searchQuery}
        statusFilter={statusFilter}
      />

      <MyProtectionPlanModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedDate}
      />
    </div>
  )
}

export default MyProtectionPlan
