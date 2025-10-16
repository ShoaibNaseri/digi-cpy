import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { MdOutlineChevronLeft, MdOutlineChevronRight } from 'react-icons/md'
import { RiEditCircleFill } from 'react-icons/ri'
import { BiSolidTrash } from 'react-icons/bi'
import { getUserById, softDeleteUser } from '@/services/adminService'
import ManageUserModal from './ManageUserModal'
import { useSchoolPortal } from '@/context/SchoolPortalContext'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import './UserTable.css'

const UserTable = () => {
  const { users, setForm, setIsModalOpen, isEducatorDashboard } =
    useSchoolPortal()
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const columns = useMemo(
    () => [
      {
        header: 'First Name',
        accessorKey: 'firstName',
        size: 120,
        minSize: 100,
        maxSize: 150
      },
      {
        header: 'Last Name',
        accessorKey: 'lastName',
        size: 120,
        minSize: 100,
        maxSize: 150
      },
      {
        header: 'Email',
        accessorKey: 'email',
        size: 250,
        minSize: 200,
        maxSize: 350
      },
      {
        header: 'Role',
        accessorKey: 'role',
        size: 100,
        minSize: 80,
        maxSize: 120,
        cell: (info) => {
          const role = info.getValue()
          if (role === 'SCHOOL_ADMIN') return 'Admin'
          if (role === 'TEACHER') return 'Teacher'
          if (role === 'STUDENT') return 'Student'
          return role
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        size: 120,
        minSize: 100,
        maxSize: 140,
        cell: (info) => {
          const status = info.getValue()
          let statusClass = 'pending'
          let displayStatus = status

          if (status === 'ACCEPTED') {
            statusClass = 'accepted'
            displayStatus = 'ACCEPTED'
          } else if (status === 'INVITED') {
            statusClass = 'invited'
            displayStatus = 'PENDING'
          } else if (status === 'DELETED') {
            statusClass = 'deleted'
            displayStatus = 'DELETED'
          } else if (status === 'PENDING') {
            statusClass = 'pending'
            displayStatus = 'PENDING'
          } else {
            statusClass = 'pending'
            displayStatus = 'ACTIVE'
          }

          return (
            <div className={`schools-user-status-badge ${statusClass}`}>
              {displayStatus}
            </div>
          )
        }
      },
      {
        header: 'Actions',
        id: 'actions',
        size: 80,
        minSize: 70,
        maxSize: 90,
        cell: (info) => (
          <div className='schools-user-actions-cell'>
            <button
              className='schools-user-action-button edit'
              onClick={() => handleEditUser(info.row.original.uid)}
            >
              <RiEditCircleFill />
            </button>
            <button
              className='schools-user-action-button delete'
              onClick={() => handleDeleteUser(info.row.original.uid)}
            >
              <BiSolidTrash />
            </button>
          </div>
        )
      }
    ],
    []
  )

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      pagination
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 50,
      size: 100,
      maxSize: 300
    }
  })

  const handleDeleteUser = async (id) => {
    setUserToDelete(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      await softDeleteUser(userToDelete)
      setDeleteModalOpen(false)
      setUserToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setUserToDelete(null)
  }

  const handleEditUser = async (id) => {
    const user = await getUserById(id)
    setForm(user)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className='schools-user-table-wrapper'>
        <div className='schools-user-table'>
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={
                        header.column.getCanSort()
                          ? 'schools-user-cursor-pointer-header select-none'
                          : ''
                      }
                      style={{ width: header.getSize() }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽'
                      }[header.column.getIsSorted()] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr className='schools-user-table-row' key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='schools-user-table-pagination'>
          <div className='schools-user-table-pagination-info'>
            Showing{' '}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
            -
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getPrePaginationRowModel().rows.length
            )}{' '}
            of {table.getPrePaginationRowModel().rows.length} users
          </div>
          <div className='schools-user-table-pagination-controls'>
            <button
              className='schools-user-table-pagination-button'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <MdOutlineChevronLeft />
            </button>
            <button
              className='schools-user-table-pagination-button'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <MdOutlineChevronRight />
            </button>
          </div>
        </div>
      </div>
      <ManageUserModal />
      <ConfirmationModal
        type='delete'
        open={deleteModalOpen}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title='Delete User'
        description='Are you sure you want to delete this user? This action cannot be undone.'
        icon={<FaTrash />}
      />
    </>
  )
}

export default UserTable
