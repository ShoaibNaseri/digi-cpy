import React from 'react'

const ChatSidebar = ({ chatIcon, onlineUsers, getAvatar }) => {
  return (
    <aside className='sidebar-chat'>
      <div className='logo'>
        <img src={chatIcon} alt='chat icon' /> Chat Moderator
      </div>
      <div className='sidebar-data'>
        <div className='title'>CHANNELS</div>
        <div className='channel active'># homeroom</div>
        <div className='channel'># general</div>
        <div className='channel'># assignments</div>
        <div className='online-users'>
          <p>ONLINE - {onlineUsers.length}</p>
          <ul>
            {onlineUsers.map((user, index) => (
              <li key={index}>
                <div className='online-users-content'>
                  <div className='online-user-img'>
                    <img
                      src={getAvatar(index)}
                      alt={`Avatar of ${user.name}`}
                    />
                  </div>
                  <div className='online-user-name'>{user.name}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default ChatSidebar
