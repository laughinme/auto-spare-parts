


export const MOCK_USERS = {

  supplier: {
    email: "supplier@test.com",
    password: "123456",
    userData: {
      id: 1,
      email: "supplier@test.com",
      name: "Тестовый Поставщик",
      role: "supplier",
      is_supplier: true,
      company_name: "ТестАвтоЗапчасти",

      created_at: "2024-01-01T00:00:00Z"
    }
  },


  buyer: {
    email: "buyer@test.com",
    password: "123456",
    userData: {
      id: 2,
      email: "buyer@test.com",
      name: "Тестовый Покупатель",
      role: "buyer",
      is_supplier: false,

      created_at: "2024-01-01T00:00:00Z"
    }
  },


  vendor: {
    email: "vendor@shop.com",
    password: "123456",
    userData: {
      id: 3,
      email: "vendor@shop.com",
      name: "Магазин Запчастей",

      company_name: "АвтоМагазин",

      created_at: "2024-01-01T00:00:00Z"
    }
  }
};


export const getMockUserByEmail = (email) => {
  return Object.values(MOCK_USERS).find((user) => user.email === email);
};