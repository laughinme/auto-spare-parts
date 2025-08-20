// Моковые пользователи для тестирования ролей
// Используйте эти данные для входа и проверки роутинга

export const MOCK_USERS = {
  // Поставщик
  supplier: {
    email: "supplier@test.com",
    password: "123456",
    userData: {
      id: 1,
      email: "supplier@test.com",
      name: "Тестовый Поставщик",
      role: "supplier", // явно указываем роль
      is_supplier: true,
      company_name: "ТестАвтоЗапчасти",
      created_at: "2024-01-01T00:00:00Z"
    }
  },
  
  // Покупатель  
  buyer: {
    email: "buyer@test.com",
    password: "123456",
    userData: {
      id: 2,
      email: "buyer@test.com", 
      name: "Тестовый Покупатель",
      role: "buyer", // явно указываем роль
      is_supplier: false,
      created_at: "2024-01-01T00:00:00Z"
    }
  },

  // Поставщик без явной роли (для тестирования автоопределения)
  vendor: {
    email: "vendor@shop.com",
    password: "123456", 
    userData: {
      id: 3,
      email: "vendor@shop.com",
      name: "Магазин Запчастей",
      // role не указана, должна определиться по email
      company_name: "АвтоМагазин",
      created_at: "2024-01-01T00:00:00Z"
    }
  }
};

// Функция для получения данных мокового пользователя
export const getMockUserByEmail = (email) => {
  return Object.values(MOCK_USERS).find(user => user.email === email);
};
