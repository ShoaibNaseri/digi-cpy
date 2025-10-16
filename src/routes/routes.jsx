import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/auth/login/Login'
import RegisterPage from '@/pages/auth/register/Register'
import LandingPage from '../pages/landing/LandingPage'
import HomePageLayout from '../layout/home/HomePageLayout'
import StudentDashboardLayout from '../layout/dashboard/student/StudentDashboardLayout'

import PrivateRoutes from './PrivateRoutes'
import RoleRoutes from './RoleRoutes'
import { ROLES } from '@/config/roles'
import TeacherDashboardLayout from '../layout/dashboard/teacher/TeacherDashboardLayout'

import EducatorAccess from '../pages/auth/access/EducatorAccess'
import TeacherClassroomPage from '../pages/dashboard/teacher/TeacherClassroomPage'
import TeacherAccessCodePage from '../pages/dashboard/teacher/TeacherAccessCodePage'
import TeacherPlannerPage from '../pages/dashboard/teacher/TeacherPlannerPage'
import TeacherAssignmentsPage from '../pages/dashboard/teacher/TeacherAssignmentsPage'
import TeacherQuizzesPage from '../pages/dashboard/teacher/TeacherQuizzesPage'
import TeacherResourcePage from '../pages/dashboard/teacher/TeacherResourcePage.jsx'
import TeacherAnalyticsPage from '../pages/dashboard/teacher/TeacherAnalyticsPage.jsx'
import TeacherCommunityPage from '../pages/dashboard/teacher/TeacherCommunityPage.jsx'
import TeacherProfilePage from '../pages/dashboard/teacher/TeacherProfilePage.jsx'
import TeacherHelpPage from '../pages/dashboard/teacher/TeacherHelpPage'
import StudentMissionPage from '../pages/dashboard/student/StudentMissionPage'
import StudentQuizzesPage from '../pages/dashboard/student/StudentQuizzesPage'
import StudentHelpPage from '../pages/dashboard/student/StudentHelpPage'
import StudentContactPage from '../pages/dashboard/student/StudentContactPage'
import ChildDashboardLayout from '../layout/dashboard/child/ChildDashboardLayout'
import ChildMissionPage from '../pages/dashboard/child/ChildMissionPage'
import ChildAssignmentsPage from '../pages/dashboard/child/ChildAssignmentsPage'
import ChildProfilePage from '../pages/dashboard/child/ChildProfilePage'
import ChildSupportChatPage from '../pages/dashboard/child/ChildSupportChatPage'
import EducatorAccessPage from '../pages/educator-access/EducatorAccessPage'
import StudentAccessPage from '../pages/student-access/StudentAccessPage'
import StudentRegistration from '../components/student-access/StudentRegistration'
import SchoolPortalSetupPage from '../pages/onboarding/school/school-portal-setup/SchoolPortalSetupPage'
import SchoolPortalSetupLayout from '../layout/onboarding/school/school-portal-setup/SchoolPortalSetupLayout'
import MissionGamePage from '../pages/game/mission/MissionGamePage.jsx'
import AdminDashboardLayout from '../layout/dashboard/admin/AdminDashboardLayout'
import QuizBuilderPage from '../pages/dashboard/admin/QuizBuilderPage'
import ChildHelpPage from '../pages/dashboard/child/ChildHelpPage'
import StudentQuizPage from '../pages/dashboard/student/StudentQuizPage'
import AllQuizzesPage from '../pages/dashboard/admin/AllQuizzesPage'
import StudentSupportChatPage from '../pages/dashboard/student/StudentSupportChatPage'
import RoleSelectPage from '../pages/onboarding/minor/RoleSelectPage'
import MinorPlanOptions from '../pages/onboarding/minor/MinorPlanOptions'
import StudyGuidePage from '../pages/dashboard/student/StudyGuidePage'
import StudentProfilePage from '../pages/dashboard/student/StudentProfilePage'
import OnboardingLayout from '../layout/onboarding/OnboardingLayout'
import PaymentPage from '@/pages/payment/PaymentPage'
import PaymentSuccessPage from '@/pages/payment/PaymentSuccessPage'
import ChildAccountTypePage from '../pages/onboarding/parent/ChildAccountTypePage'
import CreateChildAccountPage from '../pages/onboarding/parent/CreateChildAccountPage'
import FamilyPlanSetupPage from '../pages/onboarding/parent/FamilyPlanSetupPage'
import ParentSetupSummaryPage from '../pages/onboarding/parent/ParentSetupSummaryPage'
import EditProfilesPage from '../pages/onboarding/parent/EditProfilesPage'
import ParentDashboardPage from '../pages/dashboard/parent/ParentDashboardPage'
import ProtectionPlanPage from '../pages/dashboard/admin/ProtectionPlanPage'
import StudentMyProtectionPlan from '../pages/dashboard/student/StudentMyProtectionPlan'
import ChildMyProtectionPlanPlage from '../pages/dashboard/child/ChildMyProtectionPlanPlage'
import TeacherAccountSetupPage from '../pages/onboarding/school/teacher-account-setup/TeacherAccountSetupPage'
import SchoolPlanOptionsPage from '../pages/plan-options/SchoolPlanOptionsPage'
import SchoolPaymentPage from '../pages/payment/school/SchoolPaymentPage'
import AdminAccountSetupPage from '../pages/onboarding/school/admin-account-setup/AdminAccountSetupPage'
import SchoolUsers from '@/components/dashboard/educator/users/SchoolUsers'
import EducatorDashboardLayout from '@/layout/dashboard/educator/EducatorDashboardLayout'
import StudentAccountSetupPage from '@/pages/onboarding/school/student-account-setup/StudentAccountSetupPage'
import ForgotPassword from '@/pages/auth/login/ForgotPassword'
import SuccessPayment from '@/pages/payment/SuccessPayment'
import AuditLogPage from '@/pages/dashboard/admin/AuditLogPage'
import ParentSelectProfilePage from '@/pages/dashboard/parent/ParentSelectProfilePage'
import ParentDashboardLayout from '@/layout/dashboard/parent/ParentDashboardLayout'
import ParentMyProfilePage from '@/pages/dashboard/parent/ParentMyProfilePage'
import ParentHelpPage from '@/pages/dashboard/parent/ParentHelpPage'
import ParentBillingPage from '@/pages/dashboard/parent/ParentBillingPage'
import AdminProfilePage from '@/pages/dashboard/admin/AdminProfilePage'
import EducatorDashboardPage from '@/pages/dashboard/educator/EducatorDashboardPage'
import EducatorProfilePage from '@/pages/dashboard/educator/EducatorProfilePage'
import SchoolUser from '@/pages/dashboard/admin/user_accounts/school_users/SchoolUser'
import AllUser from '@/pages/dashboard/admin/user_accounts/all_users/AllUser'
import UserAnalytics from '@/pages/dashboard/admin/analytics/UserAnalytics'
import LessonAnalytics from '@/pages/dashboard/admin/analytics/LessonAnalytics'
import EducatorSchoolDetailsPage from '@/pages/dashboard/educator/EducatorSchoolDetailsPage'
import TermsOfServicePage from '@/pages/terms-of-service/TermsOfServicePage'
import PrivacyPolicyPage from '@/pages/privacy-policy/PrivacyPolicyPage'
import EducatorBillingPage from '@/pages/dashboard/educator/EducatorBillingPage'
import ParentPlanOptionsPage from '@/pages/plan-options/ParentPlanOptionsPage'
import EducatorPlanOptionsPage from '@/pages/plan-options/EducatorPlanOptionsPage'
import LawEnforcementReportPage from '@/pages/dashboard/admin/LawEnforcementReportPage'
import EducatorAccountSetup from '@/pages/auth/accountSetup/EducatorAccountSetup'
import ParentOnboarding from '@/components/onboarding/parent/ParentOnboarding'

import ChildQuizPage from '@/pages/dashboard/child/ChildQuizPage'
import ManageChildLesson from '@/components/dashboard/parent/manageLessons/ManageChildLesson'
import PasswordInspector from '@/pages/game/miniGame/passwordInsperctor/PasswordInspector'
import EducatoreLessonPage from '@/pages/dashboard/educator/EducatoreLessonPage'
import PacmanGamePage from '@/pages/game/miniGame/pacman/Pacman'

import ParentResourcePage from '@/pages/dashboard/parent/ParentResourcePage.jsx'
import AddAnotherChild from '@/components/dashboard/parent/AddAnotherCild'
import ChatModerator from '@/pages/game/miniGame/chatModerator/ChatModerator'
import HowYouReact from '@/pages/game/miniGame/houYouReact/HowYouReact'
import ParentContactPage from '@/pages/dashboard/parent/ParentContactPage'
import TeacherContactPage from '@/pages/dashboard/teacher/TeacherContactPage'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<HomePageLayout />}>
          <Route index element={<LandingPage />} />
          <Route path='/terms-of-service-en' element={<TermsOfServicePage />} />
          <Route path='/privacy-policy-en' element={<PrivacyPolicyPage />} />
        </Route>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/access' element={<EducatorAccess />} />
        <Route path='/terms-of-service-en' element={<TermsOfServicePage />} />
        <Route path='/privacy-policy-en' element={<PrivacyPolicyPage />} />
        <Route path='/educator-access' element={<EducatorAccessPage />} />
        <Route path='/student-access' element={<StudentAccessPage />} />
        <Route path='/password-inspector' element={<PasswordInspector />} />

        <Route path='/chat-moderator' element={<ChatModerator />} />
        <Route path='/how-you-react' element={<HowYouReact />} />
        <Route
          path='/student-access/registration'
          element={<StudentRegistration />}
        />
        <Route path='/pacman' element={<PacmanGamePage />} />
        <Route
          path='/school-plan-options'
          element={<SchoolPlanOptionsPage />}
        />
        {/* <Route
          path='/school-plan-options/school-payment'
          element={<SchoolPaymentPage />}
        /> */}
        <Route path='/success-payment' element={<SuccessPayment />} />
        <Route
          path='/onboarding/school-admin-signup'
          element={<AdminAccountSetupPage />}
        />
        <Route
          path='/parent-plan-options'
          element={<ParentPlanOptionsPage />}
        />
        <Route
          path='/educator-plan-options'
          element={<EducatorPlanOptionsPage />}
        />
        <Route element={<SchoolPortalSetupLayout />}>
          <Route
            path='/educator-access/school-onboarding'
            element={<SchoolPortalSetupPage />}
          />
          <Route
            path='/educator-access/teacher-account-setup'
            element={<TeacherAccountSetupPage />}
          />
          <Route
            path='/educator-access/student-account-setup'
            element={<StudentAccountSetupPage />}
          />
        </Route>
        {/* Private routes that require authentication */}
        <Route element={<PrivateRoutes />}>
          {/* Admin Dashboard Routes */}
          <Route element={<RoleRoutes allowedRoles={[ROLES.ADMIN]} />}>
            <Route path='/dashboard/admin' element={<AdminDashboardLayout />}>
              <Route element={<Navigate to='/dashboard/admin/all-quizzes' />} />
              <Route
                path='/dashboard/admin/all-quizzes'
                element={<AllQuizzesPage />}
              />
              {/* User Accounts Routes */}
              <Route
                path='/dashboard/admin/user-accounts/all-users'
                element={<AllUser />}
              />
              <Route
                path='/dashboard/admin/user-accounts/schools'
                element={<SchoolUser />}
              />
              {/* Analytics Routes */}
              <Route
                index
                path='/dashboard/admin/analytics/user-analytics'
                element={<UserAnalytics />}
              />
              <Route
                path='/dashboard/admin/analytics/lesson-analytics'
                element={<LessonAnalytics />}
              />
              <Route
                path='/dashboard/admin/quiz-builder'
                element={<QuizBuilderPage />}
              />
              <Route
                path='/dashboard/admin/quiz-builder/:quizId'
                element={<QuizBuilderPage />}
              />
              <Route
                path='/dashboard/admin/protect-plan'
                element={<ProtectionPlanPage />}
              />
              <Route
                path='/dashboard/admin/audit-logs'
                element={<AuditLogPage />}
              />
              <Route
                path='/dashboard/admin/profile'
                element={<AdminProfilePage />}
              />
              <Route
                path='/dashboard/admin/law-enforcement-reports'
                element={<LawEnforcementReportPage />}
              />
            </Route>
          </Route>

          {/* Parent Dashboard Routes */}
          <Route element={<RoleRoutes allowedRoles={[ROLES.PARENT]} />}>
            <Route element={<ParentDashboardLayout />}>
              <Route
                path='/dashboard/parent'
                element={<ParentDashboardPage />}
              />
              <Route
                path='/dashboard/parent/add-child'
                element={<AddAnotherChild />}
              />
              <Route
                path='/dashboard/parent/profile'
                element={<ParentMyProfilePage />}
              />
              <Route
                path='/dashboard/parent/teaching-resources'
                element={<ParentResourcePage />}
              />
              <Route
                path='/dashboard/parent/help'
                element={<ParentHelpPage />}
              />
              <Route
                path='/dashboard/parent/manage-lessons/:childId'
                element={<ManageChildLesson />}
              />
              <Route
                path='/dashboard/parent/billings'
                element={<ParentBillingPage />}
              />
              <Route
                path='/dashboard/parent/contact'
                element={<ParentContactPage />}
              />
            </Route>
            <Route
              path='/dashboard/parent/profiles'
              element={<ParentSelectProfilePage />}
            />
            {/* <Route path='/success-payment' element={<SuccessPayment />} /> */}
            <Route
              path='/dashboard/parent/parent-onboarding'
              element={<ParentOnboarding />}
            />
          </Route>

          {/* Teacher Routes */}
          <Route element={<RoleRoutes allowedRoles={[ROLES.TEACHER]} />}>
            {/* School Onboarding Routes */}

            <Route element={<TeacherDashboardLayout />}>
              <Route
                path='/dashboard/teacher'
                element={<Navigate to='/dashboard/teacher/classroom' />}
              />
              <Route
                path='/dashboard/teacher/classroom'
                element={<TeacherClassroomPage />}
              />
              <Route
                path='/dashboard/teacher/access-code'
                element={<TeacherAccessCodePage />}
              />
              <Route
                path='/dashboard/teacher/planner'
                element={<TeacherPlannerPage />}
              />
              <Route
                path='/dashboard/teacher/assignments'
                element={<TeacherAssignmentsPage />}
              />
              <Route
                path='/dashboard/teacher/quizzes'
                element={<TeacherQuizzesPage />}
              />
              <Route
                path='/dashboard/teacher/study-resources'
                element={<TeacherResourcePage />}
              />
              <Route
                path='/dashboard/teacher/analytics'
                element={<TeacherAnalyticsPage />}
              />
              <Route
                path='/dashboard/teacher/community'
                element={<TeacherCommunityPage />}
              />
              <Route
                path='/dashboard/teacher/profile'
                element={<TeacherProfilePage />}
              />
              <Route
                path='/dashboard/teacher/help'
                element={<TeacherHelpPage />}
              />
              <Route
                path='/dashboard/teacher/contact'
                element={<TeacherContactPage />}
              />
            </Route>
          </Route>
          {/* Student Dashboard Routes */}
          <Route element={<RoleRoutes allowedRoles={[ROLES.STUDENT]} />}>
            <Route
              path='/dashboard/student/game/mission/:missionId'
              element={<MissionGamePage />}
            />
            <Route element={<StudentDashboardLayout />}>
              <Route
                path='/dashboard/student'
                element={<Navigate to='/dashboard/student/missions' />}
              />
              <Route
                path='/dashboard/student/missions'
                element={<StudentMissionPage />}
              />
              <Route
                path='/dashboard/student/quizzes'
                element={<StudentQuizzesPage />}
              />
              <Route
                path='/dashboard/student/profile'
                element={<StudentProfilePage />}
              />
              <Route
                path='/dashboard/student/support-chat'
                element={<StudentSupportChatPage />}
              />
              <Route
                path='/dashboard/student/my-protection-plan'
                element={<StudentMyProtectionPlan />}
              />
              <Route
                path='/dashboard/student/study-guide'
                element={<StudyGuidePage />}
              />
              <Route
                path='/dashboard/student/help'
                element={<StudentHelpPage />}
              />
              <Route
                path='/dashboard/student/quiz/:quizId'
                element={<StudentQuizPage />}
              />
              <Route
                path='/dashboard/student/contact'
                element={<StudentContactPage />}
              />
            </Route>
          </Route>

          {/* Child Dashboard Routes */}
          <Route
            element={<RoleRoutes allowedRoles={[ROLES.CHILD, ROLES.PARENT]} />}
          >
            <Route
              path='/dashboard/child/game/mission/:missionId'
              element={<MissionGamePage />}
            />

            <Route element={<ChildDashboardLayout />}>
              <Route
                path='/dashboard/child'
                element={<Navigate to='/dashboard/child/missions' />}
              />
              <Route
                path='/dashboard/child/quiz/:quizId'
                element={<StudentQuizPage />}
              />

              <Route
                path='/dashboard/child/missions'
                element={<ChildMissionPage />}
              />
              <Route
                path='/dashboard/child/quizzes'
                element={<ChildQuizPage />}
              />

              <Route
                path='/dashboard/child/assignments'
                element={<ChildAssignmentsPage />}
              />
              <Route
                path='/dashboard/child/profile'
                element={<ChildProfilePage />}
              />
              <Route
                path='/dashboard/child/support-chat'
                element={<ChildSupportChatPage />}
              />
              <Route
                path='/dashboard/child/my-protection-plan'
                element={<ChildMyProtectionPlanPlage />}
              />
              <Route path='/dashboard/child/help' element={<ChildHelpPage />} />
            </Route>
          </Route>

          {/* Minor Onboarding Routes */}
          <Route
            element={
              <RoleRoutes
                allowedRoles={[
                  ROLES.STUDENT,
                  ROLES.CHILD,
                  ROLES.ADMIN,
                  ROLES.PARENT
                ]}
              />
            }
          >
            <Route element={<OnboardingLayout />}>
              <Route
                path='/onboarding/minor/role-select'
                element={<RoleSelectPage />}
              />
              <Route
                path='/onboarding/minor/plan-options'
                element={<MinorPlanOptions />}
              />
              <Route path='/onboarding/payment' element={<PaymentPage />} />
              <Route
                path='/onboarding/payment/success'
                element={<PaymentSuccessPage />}
              />
              <Route
                path='/onboarding/parent/child-account-type'
                element={<ChildAccountTypePage />}
              />
              <Route
                path='/onboarding/parent/create-child-account'
                element={<CreateChildAccountPage />}
              />
              <Route
                path='/onboarding/parent/family-plan-setup'
                element={<FamilyPlanSetupPage />}
              />
              <Route
                path='/onboarding/parent/parent-setup-summary'
                element={<ParentSetupSummaryPage />}
              />
              <Route
                path='/onboarding/parent/edit-profiles'
                element={<EditProfilesPage />}
              />
            </Route>
          </Route>

          {/* School Admin Routes */}
          <Route element={<RoleRoutes allowedRoles={[ROLES.SCHOOL_ADMIN]} />}>
            <Route
              path='/onboarding/educator/account-setup'
              element={<EducatorAccountSetup />}
            />
            <Route
              path='/school-plan-options'
              element={<SchoolPlanOptionsPage />}
            />
            <Route path='/success-payment' element={<SuccessPayment />} />
            <Route element={<EducatorDashboardLayout />}>
              <Route
                path='/dashboard/educator'
                element={<EducatorDashboardPage />}
              />
              <Route
                path='/dashboard/educator/profile'
                element={<EducatorProfilePage />}
              />
              <Route
                path='/dashboard/educator/school-users'
                element={<SchoolUsers />}
              />
              <Route
                path='/dashboard/educator/school-details'
                element={<EducatorSchoolDetailsPage />}
              />
              <Route
                path='/dashboard/educator/billing'
                element={<EducatorBillingPage />}
              />
              <Route
                path='/dashboard/educator/lessons'
                element={<EducatoreLessonPage />}
              />
            </Route>
          </Route>
        </Route>
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
