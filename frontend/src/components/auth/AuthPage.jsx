import React, { useState } from "react";

export default function AuthPage({ onLogin, onRegister }) {
	const [mode, setMode] = useState("login"); // login | register
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const canSubmit = email.trim() && password.trim();

	const submit = (e) => {
		e.preventDefault();
		if (!canSubmit) return;
		if (mode === "login") onLogin({ email: email.trim(), password });
		else onRegister({ email: email.trim(), password });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
			<div className="w-full max-w-xl px-4">
				<div className="text-center mb-8">
					<div className="w-16 h-16 mx-auto rounded-2xl bg-sky-600 shadow-lg shadow-sky-600/20" />
					<h1 className="text-5xl font-semibold mt-6 tracking-tight">{mode === "login" ? "С возвращением" : "Регистрация"}</h1>
				</div>

				<form className="mx-auto max-w-xl grid gap-4" onSubmit={submit}>
					<input
						className="input h-14 rounded-full text-base px-5"
						placeholder="Адрес электронной почты"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<input
						className="input h-14 rounded-full text-base px-5"
						placeholder="Пароль"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button className="btn primary h-14 rounded-full text-base mt-2" type="submit" disabled={!canSubmit}>
						{mode === "login" ? "Продолжить" : "Зарегистрироваться"}
					</button>
				</form>

				<div className="text-center text-lg mt-6 text-slate-700">
					{mode === "login" ? (
						<>
							У вас нет учетной записи? {" "}
							<button className="text-sky-700 hover:underline" type="button" onClick={() => setMode("register")}>Зарегистрироваться</button>
						</>
					) : (
						<>
							Уже есть аккаунт? {" "}
							<button className="text-sky-700 hover:underline" type="button" onClick={() => setMode("login")}>Войти</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
