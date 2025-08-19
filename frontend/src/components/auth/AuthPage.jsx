import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AuthPage() {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const { login, register, isLoggingIn, loginError, isRegistering, registerError } = useAuth();
    
    const isLoading = isLoggingIn || isRegistering;
    const error = mode === 'login' ? loginError : registerError;
    
    const canSubmit = email.trim() && password.trim() && !isLoading;

    const submit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        
        const credentials = { email: email.trim(), password };
        
        try {
            if (mode === 'login') {
                await login(credentials);
            } else {
                await register(credentials);
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
                    <h1 className="text-5xl font-semibold mt-6 tracking-tight">{mode === "login" ? "С возвращением" : "Регистрация"}</h1>
                </div>

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

                <div className="text-center text-lg mt-6 text-slate-700">
                    {mode === "login" ? (
                        <>
                            У вас нет учетной записи?{" "}
                            <button className="text-sky-700 hover:underline" type="button" onClick={() => setMode("register")}>Зарегистрироваться</button>
                        </>
                    ) : (
                        <>
                            Уже есть аккаунт?{" "}
                            <button className="text-sky-700 hover:underline" type="button" onClick={() => setMode("login")}>Войти</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}