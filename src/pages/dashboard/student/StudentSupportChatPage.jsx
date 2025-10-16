import SupportChat from '../../../components/dashboard/support-chat/SupportChat'
import { SupportChatProvider } from '../../../context/SupportChatContext'

const StudentSupportChatPage = () => {
  return (
    <SupportChatProvider>
      <SupportChat />
    </SupportChatProvider>
  )
}

export default StudentSupportChatPage
