import SupportChat from '../../../components/dashboard/support-chat/SupportChat'
import { SupportChatProvider } from '../../../context/SupportChatContext'

const ChildSupportChatPage = () => {
  return (
    <SupportChatProvider>
      <SupportChat />
    </SupportChatProvider>
  )
}

export default ChildSupportChatPage
