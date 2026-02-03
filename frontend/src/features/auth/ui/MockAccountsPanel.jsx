import React from "react";

export function MockAccountsPanel({ accounts, onSelect }) {
  if (!accounts) return null;

  return (
    <div className="mt-8 p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/40">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span className="text-2xl">🧪</span>
        <h3 className="text-lg font-bold text-gray-700">Тестовые аккаунты</h3>
      </div>
      <div className="space-y-3">
        {accounts.map((account) =>
        <div
          key={account.email}
          className={`p-4 rounded-xl border ${
          account.themeClasses?.container ||
          "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200"}`
          }>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                account.themeClasses?.badge || "bg-slate-500"}`
                }>

                  {account.icon}
                </div>
                <div>
                  <p
                  className={`font-semibold ${
                  account.themeClasses?.title || "text-slate-800"}`
                  }>

                    {account.label}
                  </p>
                  <p
                  className={`text-sm ${
                  account.themeClasses?.subtitle || "text-slate-600"}`
                  }>

                    {account.email}
                  </p>
                </div>
              </div>
              <button
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              account.themeClasses?.button ||
              "bg-slate-500 text-white hover:bg-slate-600"}`
              }
              type="button"
              onClick={() => onSelect(account)}>

                Заполнить
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 p-3 bg-gray-100/80 rounded-xl text-center">
        <p className="text-sm text-gray-600">
          Пароль для всех:{" "}
          <span className="font-mono bg-gray-200 px-2 py-1 rounded text-gray-800 font-semibold">
            123456
          </span>
        </p>
      </div>
    </div>);

}