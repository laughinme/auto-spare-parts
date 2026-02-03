
export const MOCK_CHATS = [
{
  id: "chat-1",
  participantName: "Поставщик AutoParts LLC",
  participantEmail: "autoparts@company.com",
  lastMessage: {
    id: "msg-1",
    content: "Да, эти тормозные колодки в наличии. Когда нужна доставка?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    senderId: "supplier-1",
    isRead: false
  },
  unreadCount: 2,
  orderId: "ord-17556859908919-1",
  isOnline: true
},
{
  id: "chat-2",
  participantName: "Покупатель Иван С.",
  participantEmail: "ivan.s@email.ru",
  lastMessage: {
    id: "msg-2",
    content: "Спасибо за быструю доставку!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    senderId: "buyer-2",
    isRead: true
  },
  unreadCount: 0,
  orderId: null,
  isOnline: false
},
{
  id: "chat-3",
  participantName: "Desert Spares Trading",
  participantEmail: "grimmzhora@spares.ae",
  lastMessage: {
    id: "msg-3",
    content: "Хорошо, отправим завтра утром",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    senderId: "supplier-3",
    isRead: true
  },
  unreadCount: 0,
  orderId: "ord-12345",
  isOnline: true
}];


export const MOCK_MESSAGES = {
  "chat-1": [
  {
    id: "msg-1-1",
    content: "Здравствуйте! Интересуют тормозные колодки для BMW 5 F10.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    senderId: "current-user",
    senderEmail: "user@email.com",
    isRead: true
  },
  {
    id: "msg-1-2",
    content: "Здравствуйте! У нас есть оригинальные и аналоги. Какие предпочитаете?",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    senderId: "supplier-1",
    senderEmail: "autoparts@company.com",
    isRead: true
  },
  {
    id: "msg-1-3",
    content: "Лучше оригинальные. Сколько стоят?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    senderId: "current-user",
    senderEmail: "user@email.com",
    isRead: true
  },
  {
    id: "msg-1-4",
    content: "Оригинальные BMW - 7200 рублей за комплект",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    senderId: "supplier-1",
    senderEmail: "autoparts@company.com",
    isRead: true
  },
  {
    id: "msg-1-5",
    content: "Отлично! Они сейчас в наличии?",
    timestamp: new Date(Date.now() - 1000 * 60 * 17),
    senderId: "current-user",
    senderEmail: "user@email.com",
    isRead: true
  },
  {
    id: "msg-1-6",
    content: "Да, эти тормозные колодки в наличии. Когда нужна доставка?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    senderId: "supplier-1",
    senderEmail: "autoparts@company.com",
    isRead: false
  }],

  "chat-2": [
  {
    id: "msg-2-1",
    content: "Ваш заказ готов к отправке",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    senderId: "current-user",
    senderEmail: "supplier@company.com",
    isRead: true
  },
  {
    id: "msg-2-2",
    content: "Отлично! Когда будет доставка?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    senderId: "buyer-2",
    senderEmail: "ivan.s@email.ru",
    isRead: true
  },
  {
    id: "msg-2-3",
    content: "Доставим завтра до 18:00",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    senderId: "current-user",
    senderEmail: "supplier@company.com",
    isRead: true
  },
  {
    id: "msg-2-4",
    content: "Спасибо за быструю доставку!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    senderId: "buyer-2",
    senderEmail: "ivan.s@email.ru",
    isRead: true
  }],

  "chat-3": [
  {
    id: "msg-3-1",
    content: "Нужны запчасти для Mercedes W204",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    senderId: "current-user",
    senderEmail: "user@email.com",
    isRead: true
  },
  {
    id: "msg-3-2",
    content: "Какие именно запчасти нужны?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
    senderId: "supplier-3",
    senderEmail: "grimmzhora@spares.ae",
    isRead: true
  },
  {
    id: "msg-3-3",
    content: "Воздушный фильтр и масляный фильтр",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30),
    senderId: "current-user",
    senderEmail: "user@email.com",
    isRead: true
  },
  {
    id: "msg-3-4",
    content: "Хорошо, отправим завтра утром",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    senderId: "supplier-3",
    senderEmail: "grimmzhora@spares.ae",
    isRead: true
  }]

};