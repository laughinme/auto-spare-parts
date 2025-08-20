import React, { useState, useEffect } from "react";
import ChatList from "./ChatList.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MOCK_CHATS, MOCK_MESSAGES } from "../../data/mockChats.js";

export default function ChatPage({ role }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load mock chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Load messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      markChatAsRead(selectedChat.id);
    }
  }, [selectedChat]);

  const loadChats = () => {
    // Simulate loading time
    setTimeout(() => {
      setChats(MOCK_CHATS);
      setLoading(false);
    }, 500);
  };

  const loadMessages = (chatId) => {
    const chatMessages = MOCK_MESSAGES[chatId] || [];
    setMessages(chatMessages);
  };

  const markChatAsRead = (chatId) => {
    // Update chat list to reflect read status
    setChats(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
  };

  const sendMessage = (content) => {
    if (!selectedChat || !content.trim() || sendingMessage) return;

    setSendingMessage(true);
    
    // Simulate sending delay
    setTimeout(() => {
      const newMessage = {
        id: `msg-${Date.now()}`,
        content: content.trim(),
        timestamp: new Date(),
        senderId: "current-user",
        senderEmail: "user@email.com",
        isRead: false
      };

      // Add new message to the list
      setMessages(prev => [...prev, newMessage]);

      // Update chat's last message
      setChats(prev => 
        prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, lastMessage: newMessage }
            : chat
        )
      );

      setSendingMessage(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500">Загрузка чатов...</p>
      </div>
    );
  }

  return (
    <div className="h-[750px] bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="flex h-full">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r bg-slate-50 flex flex-col">
          <div className="p-4 border-b bg-white flex-shrink-0">
            <h2 className="font-semibold text-lg">Сообщения</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatList 
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              role={role}
            />
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              messages={messages}
              onSendMessage={sendMessage}
              sendingMessage={sendingMessage}
              role={role}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p>Выберите чат для начала общения</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
