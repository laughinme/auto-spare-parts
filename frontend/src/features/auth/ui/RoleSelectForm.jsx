import React from "react";

export function RoleSelectForm({
  selectedRole,
  onSelectRole,
  onContinue,
  onSwitchToLogin
}) {
  return (
    <form className="space-y-6" onSubmit={onContinue}>
      <div className="space-y-4">
        <div
          onClick={() => onSelectRole("buyer")}
          className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
          selectedRole === "buyer" ?
          "border-indigo-400 bg-gradient-to-r from-indigo-50 to-sky-50 shadow-lg shadow-indigo-200/50" :
          "border-white/50 bg-white/40 hover:bg-white/60 hover:border-white/70"}`
          }>

          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl transform transition-transform ${
              selectedRole === "buyer" ? "scale-110" : ""}`
              }>

              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                🛒
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Покупатель</h3>
              <p className="text-gray-600 text-sm">
                Найти запчасти для автомобиля
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 transition-all ${
              selectedRole === "buyer" ?
              "border-indigo-500 bg-indigo-500" :
              "border-gray-300"}`
              }>

              {selectedRole === "buyer" &&
              <div className="w-full h-full rounded-full bg-white transform scale-50" />
              }
            </div>
          </div>
        </div>

        <div
          onClick={() => onSelectRole("supplier")}
          className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
          selectedRole === "supplier" ?
          "border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-200/50" :
          "border-white/50 bg-white/40 hover:bg-white/60 hover:border-white/70"}`
          }>

          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl transform transition-transform ${
              selectedRole === "supplier" ? "scale-110" : ""}`
              }>

              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                🏪
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Продавец</h3>
              <p className="text-gray-600 text-sm">
                Продавать запчасти и зарабатывать
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 transition-all ${
              selectedRole === "supplier" ?
              "border-purple-500 bg-purple-500" :
              "border-gray-300"}`
              }>

              {selectedRole === "supplier" &&
              <div className="w-full h-full rounded-full bg-white transform scale-50" />
              }
            </div>
          </div>
        </div>
      </div>

      <button
        className={`w-full h-14 rounded-2xl text-lg font-semibold transition-all duration-300 transform ${
        selectedRole ?
        "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-300/60 hover:scale-105 active:scale-95" :
        "bg-gray-200 text-gray-400 cursor-not-allowed"}`
        }
        type="submit"
        disabled={!selectedRole}>

        {selectedRole ? "✨ Продолжить" : "Выберите роль"}
      </button>

      <div className="text-center">
        <button
          className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          type="button"
          onClick={onSwitchToLogin}>

          У меня уже есть аккаунт
        </button>
      </div>
    </form>);

}