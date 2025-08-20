import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/useAuth.js";
import UserAvatar from "./UserAvatar.jsx";

export default function ChatWindow({ chat, messages, onSendMessage, sendingMessage, role }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && !sendingMessage) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Сегодня";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера";
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: 'long' 
      });
    }
  };

  const getOtherParticipantName = () => {
    return chat.participantName;
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-5 border-b bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <UserAvatar 
            email={chat.participantEmail} 
            name={chat.participantName}
            size="lg"
            isOnline={chat.isOnline}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 truncate">
              {getOtherParticipantName()}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm ${chat.isOnline ? 'text-green-600' : 'text-slate-500'}`}>
                {chat.isOnline ? 'Онлайн' : 'Был в сети недавно'}
              </span>
            </div>
            {chat.orderId && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Заказ #{chat.orderId.slice(-8)}
                </span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-6 space-y-6">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                {formatDate(new Date(date))}
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
            {dateMessages.map((message) => {
              const isOwnMessage = message.senderId === "current-user";
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar for other user's messages */}
                  {!isOwnMessage && (
                    <div className="flex-shrink-0 mt-1">
                      <UserAvatar 
                        email={message.senderEmail} 
                        size="sm"
                      />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-sm lg:max-w-lg px-4 py-3 rounded-lg ${
                      isOwnMessage
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        isOwnMessage ? 'text-sky-100' : 'text-slate-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                      {isOwnMessage && message.isRead && (
                        <span className="ml-1">✓✓</span>
                      )}
                    </p>
                  </div>
                  
                  {/* Avatar for own messages */}
                  {isOwnMessage && (
                    <div className="flex-shrink-0 mt-1">
                      <UserAvatar 
                        email="user@email.com" 
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <p>Начните беседу с сообщения</p>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="w-full resize-none border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={sendingMessage}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sendingMessage}
            className="flex-shrink-0 p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendingMessage ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
