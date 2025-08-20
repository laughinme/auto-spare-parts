import React, { useMemo, useState } from "react";
import apiProtected from "../../api/axiosInstance";
import Stepper from "./Stepper.jsx";
import RoleCard from "./RoleCard.jsx";
import TagSelector from "./TagSelector.jsx";

export default function OnboardingFlow({ onFinish }) {
	const [step, setStep] = useState(0); // 0 role, 1 details, 2 preferences, 3 summary
	const [role, setRole] = useState(null); // buyer | supplier

	// Buyer bits
	const [buyerType, setBuyerType] = useState(null); // private | workshop
	const [workshopName, setWorkshopName] = useState("");

	// Supplier bits
	const [companyName, setCompanyName] = useState("");
	const [addressLine1, setAddressLine1] = useState("");
	const [city, setCity] = useState("");
	const [phone, setPhone] = useState("");

	const canNext = useMemo(() => {
		if (step === 0) return !!role;
		if (step === 1) {
			if (role === "buyer") return !!buyerType; // optional rest
			if (role === "supplier") return companyName && addressLine1 && city && phone;
		}
		if (step === 2) return true; // preferences optional (kept for future)
		if (step === 3) return true;
		return false;
	}, [step, role, buyerType, companyName, addressLine1, city, phone]);

	const next = () => setStep((s) => Math.min(3, s + 1));
	const back = () => setStep((s) => Math.max(0, s - 1));

	const finish = async () => {
		if (role === "supplier") {
			try {
				const { data: acc } = await apiProtected.post("/organizations/account");
				const { data: sess } = await apiProtected.post("/organizations/account_session", { account: acc.account });
				onFinish({ role: "supplier", supplierProfile: { companyName, addressLine1, city, phone }, stripe: { account: acc.account, clientSecret: sess.client_secret } });
				return;
			} catch (e) {
				console.error("Stripe onboarding init failed", e);
			}
		}
		onFinish(
			role === "buyer"
				? { role: "buyer", buyerType, workshopName: buyerType === "workshop" ? (workshopName.trim() || null) : null }
				: { role: "supplier", supplierProfile: { companyName, addressLine1, city, phone } }
		);
	};

	return (
		<div className="mx-auto max-w-3xl">
			<h1 className="text-3xl font-semibold mb-2 tracking-tight">Добро пожаловать!</h1>
			<p className="text-slate-600 mb-6">Пара шагов и всё готово.</p>

			<Stepper step={step} steps={["Роль", role === "supplier" ? "Компания и адрес" : "Тип покупателя", "Предпочтения", "Готово"]} />

			<div className="mt-6 bg-white rounded-3xl shadow-lg p-6 border border-slate-100">
				{step === 0 && (
					<div>
						<h2 className="text-lg font-semibold mb-4">Кем вы планируете пользоваться платформой?</h2>
						<div className="grid sm:grid-cols-2 gap-4">
							<RoleCard
								title="Покупатель"
								desc="Ищу запчасти для своих авто или клиентов"
								selected={role === "buyer"}
								onClick={() => setRole("buyer")}
								icon="🛒"
							/>
							<RoleCard
								title="Поставщик"
								desc="Размещаю запчасти и обрабатываю заказы"
								selected={role === "supplier"}
								onClick={() => setRole("supplier")}
								icon="🏪"
							/>
						</div>
					</div>
				)}

				{step === 1 && role === "buyer" && (
					<div>
						<h2 className="text-lg font-semibold mb-4">Кто вы?</h2>
						<div className="grid sm:grid-cols-2 gap-3">
							<button className={`chip ${buyerType === "private" ? "chip--active" : ""}`} onClick={() => setBuyerType("private")}>🙋‍♂️ Частное лицо</button>
							<button className={`chip ${buyerType === "workshop" ? "chip--active" : ""}`} onClick={() => setBuyerType("workshop")}>🛠️ Автомастерская (СТО)</button>
						</div>
						{buyerType === "workshop" && (
							<div className="mt-4 grid gap-3">
								<input className="input" placeholder="Название мастерской (опц.)" value={workshopName} onChange={(e) => setWorkshopName(e.target.value)} />
								<div className="text-xs text-slate-500">В этом режиме «Гараж» отключён — автомобили клиентов меняются от заказа к заказу.</div>
							</div>
						)}
					</div>
				)}

				{step === 1 && role === "supplier" && (
					<div>
						<h2 className="text-lg font-semibold mb-4">Данные поставщика</h2>
						<div className="grid sm:grid-cols-2 gap-3">
							<input className="input" placeholder="Название компании" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
							<input className="input" placeholder="Город (Дубай и т.п.)" value={city} onChange={(e) => setCity(e.target.value)} />
							<input className="input sm:col-span-2" placeholder="Адрес (улица, офис)" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
							<input className="input sm:col-span-2" placeholder="Телефон (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} />
						</div>
						<div className="mt-4">
							<div className="h-40 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">Карта (плейсхолдер)</div>
						</div>
					</div>
				)}

				{step === 2 && (
					<div>
						<h2 className="text-lg font-semibold mb-4">Предпочтения</h2>
						<p className="text-sm text-slate-600 mb-4">Можно пропустить — FYP сгенерируется и без этого.</p>
						<TagSelector />
					</div>
				)}

				{step === 3 && (
					<div>
						<h2 className="text-lg font-semibold mb-2">Всё готово!</h2>
						<p className="text-slate-600">Нажмите «Завершить», чтобы перейти на {role === "supplier" ? "панель поставщика" : "главную"}.</p>
					</div>
				)}
			</div>

			<div className="mt-6 flex items-center justify-between">
				<button className="btn ghost" onClick={back} disabled={step === 0}>Назад</button>
				{step < 3 ? (
					<button className="btn primary" onClick={next} disabled={!canNext}>Далее</button>
				) : (
					<button className="btn primary" onClick={finish}>Завершить</button>
				)}
			</div>
		</div>
	);
}


