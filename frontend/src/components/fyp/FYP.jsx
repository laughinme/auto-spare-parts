import React, { useMemo, useState } from "react";
import AdvancedSearch from "./AdvancedSearch.jsx";
import { QUICK_TAGS } from "../../data/constants.js";
import ProductCard from "../product/ProductCard.jsx";

export default function FYP({ role, buyerType, garage, onAddVehicle, onRemoveVehicle, products, setSelectedProduct, setRoute, onAddToCart }) {
	const [query, setQuery] = useState("");
	const [brand, setBrand] = useState("");
	const [tag, setTag] = useState(null);

	const filtered = useMemo(() => {
		return products.filter((p) => {
			const q = query.trim().toLowerCase();
			if (q && !p.title.toLowerCase().includes(q) && !p.vehicle.toLowerCase().includes(q)) return false;
			if (brand && !p.vehicle.toLowerCase().includes(brand.trim().toLowerCase())) return false;
			if (tag && p.category !== tag) return false;
			return true;
		});
	}, [products, query, tag, brand]);

	return (
		<div className="space-y-6">
			{/* Advanced Search (hero) */}
			<AdvancedSearch onApply={(params) => { setQuery(params.query || ""); setBrand(params.brand || ""); }} />

			<div className="flex flex-col lg:flex-row gap-6">
				{/* Left: feed */}
				<div className="flex-1 min-w-0">
					<div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-2">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">Лента (FYP)</h1>
							{role === "buyer" && buyerType === "private" && (
								<p className="text-slate-600 text-sm">{garage?.length ? `Ваш авто в гараже: ${garage[0]}` : "Добавьте авто в гараже для точных рекомендаций."}</p>
							)}
							{role === "buyer" && buyerType === "workshop" && (
								<p className="text-slate-600 text-sm">Режим мастерской: подбирайте детали под запрос клиента. «Гараж» отключён.</p>
							)}
						</div>
						<div className="flex gap-2">
							{QUICK_TAGS.map((t) => (
								<button key={t} className={`chip ${tag === t ? "chip--active" : ""}`} onClick={() => setTag(tag === t ? null : t)}>{t}</button>
							))}
						</div>
					</div>

					<div className="mb-4 flex gap-2">
						<input className="input flex-1" placeholder="Поиск по названию, артикулу или авто…" value={query} onChange={(e) => setQuery(e.target.value)} />
						<button className="btn primary">Искать</button>
					</div>

					<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
						{filtered.map((p) => (
							<ProductCard
								key={p.id}
								product={p}
								variant="catalog"
								onView={(product) => { setSelectedProduct(product); setRoute("product"); }}
								onAddToCart={onAddToCart}
							/>
						))}
					</div>
				</div>

				{/* Right: Garage widget (private buyers only) */}
				{role === "buyer" && buyerType === "private" && (
					<div className="w-full lg:w-[360px] shrink-0">
						<GarageWidget garage={garage} onAdd={onAddVehicle} onRemove={onRemoveVehicle} />
					</div>
				)}
			</div>
		</div>
	);
}

function GarageWidget({ garage, onAdd, onRemove }) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	return (
		<div className="card p-4">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm uppercase tracking-wider text-slate-600">Гараж</div>
					<div className="text-lg font-semibold">Ваши автомобили</div>
				</div>
				<button className="btn primary" onClick={() => setOpen((v) => !v)}>{open ? "Скрыть" : "Добавить"}</button>
			</div>
			{open && (
				<div className="mt-3 flex gap-2">
					<input className="input flex-1" placeholder="Марка/модель/год или VIN" value={value} onChange={(e) => setValue(e.target.value)} />
					<button className="btn secondary" onClick={() => { if ((value||"").trim()) { onAdd(value); setValue(""); } }}>Сохранить</button>
				</div>
			)}
			<div className="mt-3 space-y-2">
				{garage.map((g) => (
					<div key={g} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
						<div className="truncate pr-2">{g}</div>
						<button className="btn ghost" onClick={() => onRemove(g)}>Удалить</button>
					</div>
				))}
				{garage.length === 0 && <div className="text-sm text-slate-500">Гараж пуст. Добавьте ваше авто для точного подбора.</div>}
			</div>
		</div>
	);
}


