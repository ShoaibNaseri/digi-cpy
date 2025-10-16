// This file is now deprecated. Use the React Query implementation from @/hooks/useTeacherQueries
// This file is kept for backward compatibility but should not be used in new components

import { useTeacherData as useTeacherDataQuery } from '@/hooks/useTeacherQueries'

/**
 * @deprecated Use useTeacherData from @/hooks/useTeacherQueries instead
 * This hook is kept for backward compatibility
 */
export const useTeacherData = (currentUser) => {
  const queryResult = useTeacherDataQuery(currentUser)

  // Return the same interface as before for backward compatibility
  return {
    ...queryResult,
    setStudentQuizzes: () => {
      console.warn(
        'setStudentQuizzes is deprecated. Data is now managed by React Query.'
      )
    },
    setClasses: () => {
      console.warn(
        'setClasses is deprecated. Data is now managed by React Query.'
      )
    },
    setClassStudents: () => {
      console.warn(
        'setClassStudents is deprecated. Data is now managed by React Query.'
      )
    }
  }
}
