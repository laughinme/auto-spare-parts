import React from "react";
import { MockAccountsPanel } from "./MockAccountsPanel.jsx";

export function CredentialsForm({
  mode,
  email,
  password,
  error,
  isLoading,
  canSubmit,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onSwitchToMode,
  mockAccounts,
  onMockSelect
}) {
  return (
    <>
      <form className="space-y-6" onSubmit={onSubmit}>
        {error &&
        <div className="p-4 text-center text-red-700 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200 animate-pulse">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <span>
                {error?.response?.data?.detail ||
              error.message ||
              "Произошла ошибка"}
              </span>
            </div>
          </div>
        }

        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
            <div className="relative">
              <input
                className="w-full h-14 px-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 text-gray-800 placeholder-gray-500 outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-lg"
                placeholder="✉️ Адрес электронной почты"
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                disabled={isLoading} />

            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
            <div className="relative">
              <input
                className="w-full h-14 px-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 text-gray-800 placeholder-gray-500 outline-none focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg"
                placeholder="🔒 Пароль"
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                disabled={isLoading} />

            </div>
          </div>
        </div>

        <button
          className={`relative w-full h-14 rounded-2xl text-lg font-semibold transition-all duration-300 transform overflow-hidden ${
          canSubmit ?
          "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-300/60 hover:scale-105 active:scale-95" :
          "bg-gray-200 text-gray-400 cursor-not-allowed"}`
          }
          type="submit"
          disabled={!canSubmit}>

          <span className="relative z-10">
            {mode === "login" ? "🚀 Войти" : "✨ Зарегистрироваться"}
          </span>
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500 to-indigo-600" />
        </button>

        <div className="flex items-center justify-center space-x-2 text-sm">
          <span className="text-gray-500">Или</span>
          <button
            className="font-semibold text-indigo-600 hover:text-purple-600 transition-colors"
            type="button"
            onClick={onSwitchToMode}>

            {mode === "login" ? "Создать аккаунт" : "У меня есть аккаунт"}
          </button>
        </div>
      </form>

      {mode === "login" && mockAccounts?.length ?
      <MockAccountsPanel accounts={mockAccounts} onSelect={onMockSelect} /> :
      null}
    </>);

}