import React, { useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { setAccessToken as setAxiosAccessToken } from "../../api/axiosInstance.js";
import { MOCK_USERS } from "../../data/mockUsers.js";

export default function AuthPage() {
    const [mode, setMode] = useState("role");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState(null); // 'buyer' | 'supplier'
    
    const { login, register, isLoggingIn, loginError, isRegistering, registerError } = useAuth();
    
    const isLoading = isLoggingIn || isRegistering;
    const error = mode === 'login' ? loginError : registerError;
    
    const canSubmit = email.trim() && password.trim() && !isLoading;

    const submit = async (e) => {
        e.preventDefault();
        if (mode === 'role') {
            if (selectedRole) setMode('register');
            return;
        }
        if (!canSubmit) return;

        const credentials = { email: email.trim(), password };

        try {
            if (mode === 'login') {
                const loginResult = await login(credentials);
                // После логина нужно подождать, пока загрузится профиль пользователя
                // Перенаправление произойдет автоматически в App.jsx через useEffect с ролью
                console.log('Login successful:', loginResult);
            } else if (mode === 'register') {
                const reg = await register(credentials);
                const newAccessToken = reg?.access_token || null;
                if (newAccessToken) {
                  setAxiosAccessToken(newAccessToken);
                }
                if (selectedRole === 'buyer') {
                    window.__setRoute && window.__setRoute('fyp');
                }
                if (selectedRole === 'supplier') {
                  window.__setRoute && window.__setRoute('onboarding:supplier_stripe');
                }
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
            <div className="w-full max-w-xl px-4">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-600 shadow-lg shadow-sky-600/20" />
                    <h1 className="text-5xl font-semibold mt-6 tracking-tight">
                        {mode === "role" ? "Кем вы будете пользоваться?" : mode === "login" ? "С возвращением" : "Регистрация"}
                    </h1>
                </div>

                {mode === 'role' && (
                    <form className="mx-auto max-w-xl grid gap-4" onSubmit={submit}>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              aria-pressed={selectedRole === 'buyer'}
                              className={`px-3 py-2 rounded-full border text-sm transition ${selectedRole === 'buyer' ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
                              onClick={() => setSelectedRole('buyer')}
                            >
                              🛒 Покупатель
                            </button>
                            <button
                              type="button"
                              aria-pressed={selectedRole === 'supplier'}
                              className={`px-3 py-2 rounded-full border text-sm transition ${selectedRole === 'supplier' ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
                              onClick={() => setSelectedRole('supplier')}
                            >
                              🏪 Продавец
                            </button>
                        </div>
                        <button className="btn primary h-14 rounded-full text-base mt-2" type="submit" disabled={!selectedRole}>Продолжить</button>
                        <div className="text-center text-lg mt-2 text-slate-700">
                            <button className="text-sky-700 hover:underline" type="button" onClick={() => setMode('login')}>У меня уже есть аккаунт</button>
                        </div>
                    </form>
                )}

                {(mode === 'login' || mode === 'register') && (
                <form className="mx-auto max-w-xl grid gap-4" onSubmit={submit}>
                    {error && (
                        <div className="p-3 text-center text-red-700 bg-red-100 rounded-xl">
                           {error?.response?.data?.detail || error.message || "Произошла ошибка"}
                        </div>
                    )}
                    <input
                        className="input h-14 rounded-full text-base px-5"
                        placeholder="Адрес электронной почты"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                    <input
                        className="input h-14 rounded-full text-base px-5"
                        placeholder="Пароль"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                    <button className="btn primary h-14 rounded-full text-base mt-2" type="submit" disabled={!canSubmit}>
                        {isLoading ? "Загрузка..." : (mode === "login" ? "Продолжить" : "Зарегистрироваться")}
                    </button>
                </form>
                )}

                <div className="text-center text-lg mt-6 text-slate-700">
                    {mode === "login" ? (
                        <>
                            У вас нет учетной записи?{" "}
                            <button className="text-sky-700 hover:underline" type="button" onClick={() => setMode("role")}>Зарегистрироваться</button>
                        </>
                    ) : mode === 'register' ? (
                        <>
                            Уже есть аккаунт?{" "}
                            <button className="text-sky-700 hover:underline" type="button" onClick={() => setMode("login")}>Войти</button>
                        </>
                    ) : null}
                </div>

                {/* Тестовые аккаунты */}
                {mode === 'login' && (
                    <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Тестовые аккаунты:</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                                <div>
                                    <span className="font-medium text-emerald-700">Поставщик:</span>
                                    <span className="ml-2 text-slate-600">{MOCK_USERS.supplier.email}</span>
                                </div>
                                <button 
                                    className="text-xs text-sky-600 hover:underline"
                                    onClick={() => {
                                        setEmail(MOCK_USERS.supplier.email);
                                        setPassword(MOCK_USERS.supplier.password);
                                    }}
                                >
                                    Заполнить
                                </button>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                                <div>
                                    <span className="font-medium text-blue-700">Покупатель:</span>
                                    <span className="ml-2 text-slate-600">{MOCK_USERS.buyer.email}</span>
                                </div>
                                <button 
                                    className="text-xs text-sky-600 hover:underline"
                                    onClick={() => {
                                        setEmail(MOCK_USERS.buyer.email);
                                        setPassword(MOCK_USERS.buyer.password);
                                    }}
                                >
                                    Заполнить
                                </button>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                                <div>
                                    <span className="font-medium text-purple-700">Автоопределение:</span>
                                    <span className="ml-2 text-slate-600">{MOCK_USERS.vendor.email}</span>
                                </div>
                                <button 
                                    className="text-xs text-sky-600 hover:underline"
                                    onClick={() => {
                                        setEmail(MOCK_USERS.vendor.email);
                                        setPassword(MOCK_USERS.vendor.password);
                                    }}
                                >
                                    Заполнить
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Пароль для всех: <code className="bg-slate-200 px-1 rounded">123456</code>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}