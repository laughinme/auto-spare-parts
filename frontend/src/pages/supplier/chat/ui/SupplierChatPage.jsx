import React, { useState, useEffect } from "react";
import ChatList from "../../../../entities/chat/ui/ChatList.jsx";
import ChatWindow from "../../../../entities/chat/ui/ChatWindow.jsx";
import {
  MOCK_CHATS,
  MOCK_MESSAGES } from
"../../../../shared/mocks/mockChats.js";

export default function SupplierChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);


  useEffect(() => {
    loadSupplierChats();
  }, []);


  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      markChatAsRead(selectedChat.id);
    }
  }, [selectedChat]);

  const loadSupplierChats = () => {

    setTimeout(() => {

      const supplierChats = MOCK_CHATS.map((chat) => ({
        ...chat,

        title: chat.buyerName || chat.title,
        subtitle: `Заказ #${chat.orderId || Math.floor(Math.random() * 10000)}`,
        role: "supplier"
      }));

      setChats(supplierChats);
      setLoading(false);
    }, 500);
  };

  const loadMessages = (chatId) => {
    const chatMessages = MOCK_MESSAGES[chatId] || [];
    setMessages(chatMessages);
  };

  const markChatAsRead = (chatId) => {

    setChats((prev) =>
    prev.map((chat) =>
    chat.id === chatId ?
    { ...chat, unreadCount: 0 } :
    chat
    )
    );
  };

  const sendMessage = (content) => {
    if (!selectedChat || !content.trim() || sendingMessage) return;

    setSendingMessage(true);


    setTimeout(() => {
      const newMessage = {
        id: `msg-${Date.now()}`,
        content: content.trim(),
        timestamp: new Date(),
        senderId: "supplier-user",
        senderEmail: "supplier@company.com",
        senderName: "Поставщик",
        isRead: false,
        role: "supplier"
      };


      setMessages((prev) => [...prev, newMessage]);


      setChats((prev) =>
      prev.map((chat) =>
      chat.id === selectedChat.id ?
      { ...chat, lastMessage: newMessage } :
      chat
      )
      );

      setSendingMessage(false);


      setTimeout(() => {
        const buyerResponse = {
          id: `msg-${Date.now()}-response`,
          content: "Спасибо за информацию! Уточню детали и свяжусь с вами.",
          timestamp: new Date(),
          senderId: "buyer-user",
          senderEmail: "buyer@email.com",
          senderName: "Покупатель",
          isRead: false,
          role: "buyer"
        };

        setMessages((prev) => [...prev, buyerResponse]);
        setChats((prev) =>
        prev.map((chat) =>
        chat.id === selectedChat.id ?
        { ...chat, lastMessage: buyerResponse, unreadCount: (chat.unreadCount || 0) + 1 } :
        chat
        )
        );
      }, 2000);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500">Загрузка чатов...</p>
      </div>);

  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Сообщения с покупателями</h1>
          <p className="text-slate-600 mt-1">
            Общайтесь с покупателями по вопросам заказов и товаров
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm text-slate-500">Активных чатов</p>
            <p className="text-xl font-bold text-slate-900">{chats.length}</p>
          </div>
        </div>
      </div>

      {}
      <div className="h-[700px] bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
        <div className="flex h-full">
          {}
          <div className="w-1/3 border-r bg-slate-50 flex flex-col">
            <div className="p-6 border-b bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Чаты с покупателями</h2>
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {chats.filter((chat) => chat.unreadCount > 0).length} непрочитанных
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatList
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                role="supplier" />

            </div>
          </div>

          {}
          <div className="flex-1 flex flex-col">
            {selectedChat ?
            <ChatWindow
              chat={selectedChat}
              messages={messages}
              onSendMessage={sendMessage}
              sendingMessage={sendingMessage}
              role="supplier" /> :


            <div className="flex h-full items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-slate-700 mb-2">Выберите чат с покупателем</p>
                  <p className="text-sm text-slate-500">Отвечайте на вопросы о товарах и заказах</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-900">Быстрые ответы</p>
            <p className="text-sm text-slate-600">Настройте шаблоны ответов</p>
          </div>
        </div>
        
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-900">Автоматизация</p>
            <p className="text-sm text-slate-600">Уведомления о заказах</p>
          </div>
        </div>
        
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-900">Аналитика чатов</p>
            <p className="text-sm text-slate-600">Время ответа и рейтинг</p>
          </div>
        </div>
      </div>
    </div>);

}