import React from "react";

export function AuthHeader({ mode }) {
  return (
    <div className="text-center mb-8">
      <div className="relative inline-block">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 shadow-2xl shadow-indigo-500/30 transform rotate-3 hover:rotate-6 transition-transform duration-300" />
        <div className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mt-6 tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
        {mode === "role" &&
        <>
            Выберите
            <br />
            свою роль
          </>
        }
        {mode === "login" &&
        <>
            Добро
            <br />
            пожаловать
          </>
        }
        {mode === "register" &&
        <>
            Создать
            <br />
            аккаунт
          </>
        }
      </h1>
      <p className="text-gray-600 mt-3 text-lg font-medium">
        {mode === "role" ?
        "Начните свое путешествие с нами" :
        mode === "login" ?
        "Рады видеть вас снова" :
        "Присоединяйтесь к нашему сообществу"}
      </p>
    </div>);

}