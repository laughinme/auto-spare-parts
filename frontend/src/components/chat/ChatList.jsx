import React from "react";
import UserAvatar from "./UserAvatar.jsx";

export default function ChatList({ chats, selectedChat, onSelectChat, role }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Вчера';
    } else if (days < 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  };

  const getOtherParticipantName = (chat) => {
    return chat.participantName;
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message || message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500">
        <p>У вас пока нет сообщений</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
            selectedChat?.id === chat.id ? 'bg-white border-l-4 border-l-sky-500' : ''
          }`}
          onClick={() => onSelectChat(chat)}
        >
          <div className="flex items-start gap-3">
            {/* User Avatar */}
            <div className="flex-shrink-0 mt-0.5">
              <UserAvatar 
                email={chat.participantEmail} 
                name={chat.participantName}
                size="md"
                isOnline={chat.isOnline}
              />
            </div>
            
            {/* Chat Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-sm truncate">
                  {getOtherParticipantName(chat)}
                </h3>
                {chat.lastMessage && (
                  <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                    {formatTime(chat.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {chat.lastMessage ? (
                    <p className="text-sm text-slate-600 truncate">
                      {truncateMessage(chat.lastMessage.content)}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      Нет сообщений
                    </p>
                  )}
                </div>
                
                {chat.unreadCount > 0 && (
                  <div className="ml-2 flex-shrink-0">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-sky-500 rounded-full min-w-[20px]">
                      {chat.unreadCount}
                    </span>
                  </div>
                )}
              </div>

              {chat.orderId && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                    Заказ #{chat.orderId.slice(-8)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
