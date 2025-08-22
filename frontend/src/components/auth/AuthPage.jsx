import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth.js";
import { setAccessToken as setAxiosAccessToken } from "../../api/axiosInstance.js";
import { MOCK_USERS } from "../../data/mockUsers.js";

export default function AuthPage() {
    const [mode, setMode] = useState("role");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState(null); // 'buyer' | 'supplier'
    const [isVisible, setIsVisible] = useState(false);
    
    const { login, register, isLoggingIn, loginError, isRegistering, registerError } = useAuth();
    
    const isLoading = isLoggingIn || isRegistering;
    const error = mode === 'login' ? loginError : registerError;
    
    const canSubmit = email.trim() && password.trim() && !isLoading;

    // Animation trigger
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        if (mode === 'role') {
            if (selectedRole) setMode('register');
            return;
        }
        if (!canSubmit) return;

        const credentials = { email: email.trim(), password };
        
        // Добавляем роль при регистрации
        if (mode === 'register' && selectedRole) {
            credentials.role = selectedRole;
        }

        try {
            if (mode === 'login') {
                const loginResult = await login(credentials);
                // После логина перенаправление произойдет автоматически в App.jsx через useEffect с ролью
                console.log('Login successful:', loginResult);
            } else if (mode === 'register') {
                const reg = await register(credentials);
                const newAccessToken = reg?.access_token || null;
                if (newAccessToken) {
                  setAxiosAccessToken(newAccessToken);
                }
                // При регистрации используем выбранную роль для перенаправления
                if (selectedRole === 'buyer') {
                    window.__setRoute && window.__setRoute('fyp');
                } else if (selectedRole === 'supplier') {
                    window.__setRoute && window.__setRoute('onboarding:supplier_stripe');
                }
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50"></div>
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full opacity-60 animate-float"></div>
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-float-delayed"></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full opacity-80 animate-float"></div>
                <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-pink-400 rounded-full opacity-50 animate-float-delayed"></div>
            </div>

            {/* Main Content */}
            <div className="relative min-h-screen flex items-center justify-center px-4">
                <div className={`w-full max-w-lg transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    {/* Glassmorphism Container */}
                    <div className="backdrop-blur-lg bg-white/20 rounded-3xl border border-white/30 shadow-2xl p-8 relative">
                        {/* Header */}
                        <div className="text-center mb-8">
                            {/* Logo with gradient and shadow */}
                            <div className="relative inline-block">
                                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 shadow-2xl shadow-indigo-500/30 transform rotate-3 hover:rotate-6 transition-transform duration-300"></div>
                                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
                            </div>
                            
                            {/* Title with enhanced typography */}
                            <h1 className="text-4xl md:text-5xl font-bold mt-6 tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                                {mode === "role" ? (
                                    <span>Выберите<br />свою роль</span>
                                ) : mode === "login" ? (
                                    <span>Добро<br />пожаловать</span>
                                ) : (
                                    <span>Создать<br />аккаунт</span>
                                )}
                            </h1>
                            
                            {/* Subtitle */}
                            <p className="text-gray-600 mt-3 text-lg font-medium">
                                {mode === "role" 
                                    ? "Начните свое путешествие с нами" 
                                    : mode === "login" 
                                    ? "Рады видеть вас снова" 
                                    : "Присоединяйтесь к нашему сообществу"
                                }
                            </p>
                </div>

                {mode === 'role' && (
                            <form className="space-y-6" onSubmit={submit}>
                                {/* Role Selection Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Buyer Card */}
                                    <div 
                                        onClick={() => setSelectedRole('buyer')}
                                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                            selectedRole === 'buyer' 
                                                ? 'border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg shadow-indigo-200/50' 
                                                : 'border-white/50 bg-white/40 hover:bg-white/60 hover:border-white/70'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl transform transition-transform ${
                                                selectedRole === 'buyer' ? 'scale-110' : ''
                                            }`}>
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                                    🛒
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">Покупатель</h3>
                                                <p className="text-gray-600 text-sm">Найти запчасти для автомобиля</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                                                selectedRole === 'buyer' 
                                                    ? 'border-indigo-500 bg-indigo-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {selectedRole === 'buyer' && (
                                                    <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Supplier Card */}
                                    <div 
                                        onClick={() => setSelectedRole('supplier')}
                                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                            selectedRole === 'supplier' 
                                                ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-200/50' 
                                                : 'border-white/50 bg-white/40 hover:bg-white/60 hover:border-white/70'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl transform transition-transform ${
                                                selectedRole === 'supplier' ? 'scale-110' : ''
                                            }`}>
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                                                    🏪
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">Продавец</h3>
                                                <p className="text-gray-600 text-sm">Продавать запчасти и зарабатывать</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                                                selectedRole === 'supplier' 
                                                    ? 'border-purple-500 bg-purple-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {selectedRole === 'supplier' && (
                                                    <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Continue Button */}
                            <button
                                    className={`w-full h-14 rounded-2xl text-lg font-semibold transition-all duration-300 transform ${
                                        selectedRole 
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-300/60 hover:scale-105 active:scale-95' 
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`} 
                                    type="submit" 
                                    disabled={!selectedRole}
                                >
                                    {selectedRole ? '✨ Продолжить' : 'Выберите роль'}
                            </button>

                                {/* Switch to Login */}
                                <div className="text-center">
                            <button
                                        className="text-gray-600 hover:text-indigo-600 transition-colors font-medium" 
                              type="button"
                                        onClick={() => setMode('login')}
                            >
                                        У меня уже есть аккаунт
                            </button>
                        </div>
                    </form>
                )}

                        {(mode === 'login' || mode === 'register') && (
                            <form className="space-y-6" onSubmit={submit}>
                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 text-center text-red-700 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200 animate-pulse">
                                        <div className="flex items-center justify-center space-x-2">
                                            <span className="text-red-500">⚠️</span>
                                            <span>{error?.response?.data?.detail || error.message || "Произошла ошибка"}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Input Fields */}
                                <div className="space-y-4">
                                    {/* Email Input */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                                        <div className="relative">
                                            <input
                                                className="w-full h-14 px-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 text-gray-800 placeholder-gray-500 outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-lg"
                                                placeholder="✉️ Адрес электронной почты"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                                        <div className="relative">
                                            <input
                                                className="w-full h-14 px-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 text-gray-800 placeholder-gray-500 outline-none focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg"
                                                placeholder="🔒 Пароль"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button 
                                    className={`relative w-full h-14 rounded-2xl text-lg font-semibold transition-all duration-300 transform overflow-hidden ${
                                        canSubmit 
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-300/60 hover:scale-105 active:scale-95' 
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`} 
                                    type="submit" 
                                    disabled={!canSubmit}
                                >
                                    {isLoading && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 animate-pulse"></div>
                                    )}
                                    <span className="relative z-10 flex items-center justify-center space-x-2">
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Загрузка...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{mode === "login" ? "🚀 Войти" : "✨ Зарегистрироваться"}</span>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>
                        )}

                        {/* Mode Switcher */}
                        <div className="text-center mt-8">
                            {mode === "login" ? (
                                <div className="space-y-2">
                                    <p className="text-gray-600">У вас нет учетной записи?</p>
                                    <button 
                                        className="text-indigo-600 hover:text-purple-600 transition-colors font-semibold text-lg" 
                                        type="button" 
                                        onClick={() => setMode("role")}
                                    >
                                        Зарегистрироваться ✨
                                    </button>
                                </div>
                            ) : mode === 'register' ? (
                                <div className="space-y-2">
                                    <p className="text-gray-600">Уже есть аккаунт?</p>
                                    <button 
                                        className="text-indigo-600 hover:text-purple-600 transition-colors font-semibold text-lg" 
                                        type="button" 
                                        onClick={() => setMode("login")}
                                    >
                                        Войти 🚀
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {/* Test Accounts */}
                        {mode === 'login' && (
                            <div className="mt-8 p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/40">
                                <div className="flex items-center justify-center space-x-2 mb-4">
                                    <span className="text-2xl">🧪</span>
                                    <h3 className="text-lg font-bold text-gray-700">Тестовые аккаунты</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    {/* Supplier Account */}
                                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">П</div>
                                                <div>
                                                    <p className="font-semibold text-emerald-800">Поставщик</p>
                                                    <p className="text-sm text-emerald-600">{MOCK_USERS.supplier.email}</p>
                                                </div>
                                            </div>
                                            <button 
                                                className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                                                onClick={() => {
                                                    setEmail(MOCK_USERS.supplier.email);
                                                    setPassword(MOCK_USERS.supplier.password);
                                                }}
                                            >
                                                Заполнить
                                            </button>
                                        </div>
                                    </div>

                                    {/* Buyer Account */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">П</div>
                                                <div>
                                                    <p className="font-semibold text-blue-800">Покупатель</p>
                                                    <p className="text-sm text-blue-600">{MOCK_USERS.buyer.email}</p>
                                                </div>
                                            </div>
                                            <button 
                                                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                                onClick={() => {
                                                    setEmail(MOCK_USERS.buyer.email);
                                                    setPassword(MOCK_USERS.buyer.password);
                                                }}
                                            >
                                                Заполнить
                                            </button>
                                        </div>
                                    </div>

                                    {/* Vendor Account */}
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">А</div>
                                                <div>
                                                    <p className="font-semibold text-purple-800">Автоопределение</p>
                                                    <p className="text-sm text-purple-600">{MOCK_USERS.vendor.email}</p>
                                                </div>
                                            </div>
                                            <button 
                                                className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                                                onClick={() => {
                                                    setEmail(MOCK_USERS.vendor.email);
                                                    setPassword(MOCK_USERS.vendor.password);
                                                }}
                                            >
                                                Заполнить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 p-3 bg-gray-100/80 rounded-xl text-center">
                                    <p className="text-sm text-gray-600">
                                        Пароль для всех: <span className="font-mono bg-gray-200 px-2 py-1 rounded text-gray-800 font-semibold">123456</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}