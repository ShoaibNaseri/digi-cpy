import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import {
  FaPlus,
  FaUser,
  FaEdit,
  FaTrash,
  FaUser as FaUserIcon
} from 'react-icons/fa'
import Avatar from '@/components/common/avatar/Avatar'
import { calculateAge } from '@/utils/ageCalculator'
import {
  useChildrenProfiles,
  useSubscription,
  useAddChild,
  useUpdateChildren,
  useDeleteChild
} from '@/hooks/useParentQueries'
import { TbAlertHexagonFilled } from 'react-icons/tb'
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal'
import DeletedAccountInfoModal from '@/components/common/DeletedAccountInfoModal'
import AddChildFormModal from '@/components/common/modals/AddChildFormModal'
import './AddAnotherChild.css'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useParentMenuItems from '@/hooks/useParentMenuItems'
import PageLoader from '@/components/common/preloaders/PagePreloader'
const AddAnotherChild = () => {
  const { currentUser } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [childToDelete, setChildToDelete] = useState(null)
  const [showDeletedAccountModal, setShowDeletedAccountModal] = useState(false)
  const [deletedChildData, setDeletedChildData] = useState(null)
  const menuItems = useParentMenuItems()

  // React Query hooks
  const {
    data: children = [],
    isLoading: childrenLoading,
    error: childrenError
  } = useChildrenProfiles(currentUser?.uid, !!currentUser?.uid)

  const {
    data: subscriptionData = 'basic',
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useSubscription(currentUser?.uid, !!currentUser?.uid)

  const addChildMutation = useAddChild()
  const updateChildrenMutation = useUpdateChildren()
  const deleteChildMutation = useDeleteChild()

  const isLoading =
    childrenLoading ||
    subscriptionLoading ||
    addChildMutation.isPending ||
    updateChildrenMutation.isPending ||
    deleteChildMutation.isPending

  const resetForm = () => {
    setEditingChild(null)
    setShowAddForm(false)
  }

  const handleAddChild = async (formData) => {
    if (!currentUser?.uid) {
      toast.error('Parent ID not found. Please log in again.')
      return
    }

    // Check if user can add more children based on their plan
    if (!canAddMoreChildren()) {
      const maxChildren = getMaxChildren()
      const planName = getPlanDisplayName()
      toast.error(
        `You have reached the maximum limit of ${maxChildren} child${
          maxChildren > 1 ? 'ren' : ''
        } for your ${planName}. Please upgrade your plan to add more children.`
      )
      return
    }

    const newChild = {
      childId: uuidv4(),
      parentId: currentUser.uid,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      birthDay: formData.birthDay,
      accountCreated: new Date().toISOString(),
      accountStatus: 'Active'
    }

    addChildMutation.mutate(
      {
        parentId: currentUser.uid,
        children: [newChild]
      },
      {
        onSuccess: () => {
          resetForm()
        }
      }
    )
  }

  const handleEditChild = (child) => {
    setEditingChild(child)
    setShowAddForm(true)
  }

  const handleUpdateChild = async (formData, editingChild) => {
    if (!currentUser?.uid) {
      toast.error('Parent ID not found. Please log in again.')
      return
    }

    const updatedChildren = children.map((child) =>
      child.childId === editingChild.childId
        ? {
            ...child,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            birthDay: formData.birthDay,
            accountCreated: child.accountCreated, // Preserve original creation date
            accountStatus: child.accountStatus // Preserve original status
          }
        : child
    )

    updateChildrenMutation.mutate(
      {
        parentId: currentUser.uid,
        children: updatedChildren
      },
      {
        onSuccess: () => {
          resetForm()
        }
      }
    )
  }

  const handleFormSubmit = (formData, editingChild) => {
    if (editingChild) {
      handleUpdateChild(formData, editingChild)
    } else {
      handleAddChild(formData)
    }
  }

  const handleDeleteChild = (childId) => {
    const child = children.find((c) => c.childId === childId)
    if (child) {
      setChildToDelete(child)
      setShowDeleteModal(true)
    }
  }

  const confirmDeleteChild = () => {
    if (!currentUser?.uid) {
      toast.error('Parent ID not found. Please log in again.')
      return
    }

    deleteChildMutation.mutate({
      parentId: currentUser.uid,
      childId: childToDelete.childId
    })
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setChildToDelete(null)
  }

  const handleShowDeletedAccountInfo = (child) => {
    setDeletedChildData(child)
    setShowDeletedAccountModal(true)
  }

  const closeDeletedAccountModal = () => {
    setShowDeletedAccountModal(false)
    setDeletedChildData(null)
  }

  // Get maximum children based on subscription plan
  const getMaxChildren = () => {
    if (!subscriptionData) return 1

    return subscriptionData.planType === 'multipleYearly' ||
      subscriptionData.planType === 'multipleMonthly' ||
      subscriptionData.planType === 'family'
      ? 3
      : 1
  }

  // Get plan display name
  const getPlanDisplayName = () => {
    if (!subscriptionData) return 'Basic Plan'

    return subscriptionData.planType === 'multipleYearly' ||
      subscriptionData.planType === 'multipleMonthly' ||
      subscriptionData.planType === 'family'
      ? 'Family Plan'
      : 'Individual Plan'
  }

  // Check if user can add more children
  const canAddMoreChildren = () => {
    return children.length < getMaxChildren()
  }

  // Handle loading and error states
  if (childrenLoading || subscriptionLoading) {
    return <PageLoader textData='Loading children profiles...' />
  }

  if (childrenError || subscriptionError) {
    return (
      <div className='add-child-container'>
        <div className='add-child-content'>
          <PageHeader
            title='Children Profile Management'
            subtitle='Error loading data'
            menuItems={menuItems}
          />
          <div className='add-child-error-state'>
            <h3>Error loading data</h3>
            <p>
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className='add-child-container'>
      <div className='add-child-content'>
        <PageHeader
          title='Children Profile Management'
          subtitle={`Manage your children profiles (${getPlanDisplayName()})`}
          menuItems={menuItems}
        />

        {/* Children List Section */}
        <div className='add-child-children-list-section'>
          <div className='add-child-section-header'>
            <div className='add-child-section-title'>
              <h2>
                Current Children Profiles ({children.length}/{getMaxChildren()})
              </h2>
              <p className='add-child-plan-info'>
                {getPlanDisplayName()} - Maximum {getMaxChildren()} child
                {getMaxChildren() > 1 ? 'ren' : ''}
              </p>
            </div>

            <button
              className={`add-child-page-btn ${
                !canAddMoreChildren() ? 'disabled' : ''
              }`}
              onClick={() => setShowAddForm(true)}
              disabled={isLoading || !canAddMoreChildren()}
              title={
                !canAddMoreChildren()
                  ? `Maximum ${getMaxChildren()} children reached for your plan`
                  : 'Add another child'
              }
            >
              {!canAddMoreChildren()
                ? 'Limit Reached'
                : '<FaPlus /> Add Another Child'}
            </button>
          </div>

          {children.length === 0 ? (
            <div className='add-child-empty-state'>
              <FaUser className='add-child-empty-icon' />
              <h3>No children profiles yet</h3>
              <p>Add your first child profile to get started</p>
              <p className='add-child-plan-limit-info'>
                {getPlanDisplayName()} allows up to {getMaxChildren()} child
                {getMaxChildren() > 1 ? 'ren' : ''}
              </p>
              <button
                className='add-child-first-child-btn'
                onClick={() => setShowAddForm(true)}
                disabled={!canAddMoreChildren()}
              >
                <FaPlus />
                Add Your First Child
              </button>
            </div>
          ) : (
            <div className='add-child-children-grid'>
              {children.map((child) => (
                <div
                  key={child.childId}
                  className={`add-child-child-card ${
                    child.isDeleted ? 'deleted' : ''
                  }`}
                >
                  <div className='add-child-child-info'>
                    <div className='add-child-child-avatar'>
                      <Avatar name={child.firstName} size={60} />
                    </div>
                    {child.isDeleted ? (
                      <div className='add-child-child-details'>
                        <h3>
                          {child.firstName} {child.lastName}{' '}
                        </h3>
                        <p>
                          <span className='add-child-deleted-span'>
                            <TbAlertHexagonFilled />
                            Account has been deleted
                          </span>
                        </p>
                        <p className='add-child-birth-date'>
                          Deleted at:{' '}
                          {new Date(child.deletedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className='add-child-child-details'>
                        <h3>
                          {child.firstName} {child.lastName}
                        </h3>
                        <p>Age {calculateAge(child.birthDay)}</p>
                        <p className='add-child-birth-date'>
                          Born: {new Date(child.birthDay).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {child.isDeleted ? (
                    <div className='deleted-child-child-actions'>
                      <button
                        className='add-child-detials-btn'
                        onClick={() => handleShowDeletedAccountInfo(child)}
                      >
                        Details
                      </button>
                    </div>
                  ) : (
                    <div className='add-child-child-actions'>
                      <button
                        className='add-child-edit-btn'
                        onClick={() => handleEditChild(child)}
                        title='Edit child'
                      >
                        Edit Profile
                      </button>
                      <button
                        className='add-child-delete-btn'
                        onClick={() => handleDeleteChild(child.childId)}
                        title='Delete child'
                      >
                        Delete Profile
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        <AddChildFormModal
          isOpen={showAddForm}
          onClose={resetForm}
          onSubmit={handleFormSubmit}
          editingChild={editingChild}
          isLoading={isLoading}
          title={editingChild ? 'Edit Child Profile' : 'Add Your Child Profile'}
          submitButtonText={editingChild ? 'Update Profile' : 'Save Profile'}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteChild}
          title='Delete Child Profile'
          message={`Are you sure you want to delete your child's profile?`}
          itemName={
            childToDelete
              ? `${childToDelete.firstName} ${childToDelete.lastName}`
              : ''
          }
          warningText=' This profile will be permanently deleted in 30 days. 
 During that time, it still counts toward your plan limit.'
          confirmButtonText='Delete Profile'
          cancelButtonText='Cancel'
        />

        {/* Deleted Account Info Modal */}
        <DeletedAccountInfoModal
          isOpen={showDeletedAccountModal}
          onClose={closeDeletedAccountModal}
          childData={deletedChildData}
        />
      </div>
    </div>
  )
}

export default AddAnotherChild
