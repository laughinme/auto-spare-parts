import React, { useEffect, useMemo, useState } from "react";
import { SUPPLIER_SELF_ID } from "../../data/constants.js";

/** Add product for current supplier (pure) */
function addSupplierProductPure(products, supplierProfile, payload) {
	const id = `p${Date.now()}`;
	const newProd = {
		id,
		title: payload.title,
		price: Number(payload.price) || 0,
		currency: "RUB",
		supplierId: SUPPLIER_SELF_ID,
		supplierName: supplierProfile?.companyName || "My Parts Company",
		condition: payload.condition || "new",
		shipEtaDays: Number(payload.shipEtaDays) || 12,
		category: payload.category || "Misc",
		vehicle: payload.vehicle || "Any",
		img: payload.img || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
	};
	return [...products, newProd];
}

export default function SupplierProducts({ products, setProducts, supplierProfile, onCreateNavigate }) {
	const [query, setQuery] = useState("");

	const myProducts = useMemo(() => products.filter((p) => p.supplierId === SUPPLIER_SELF_ID), [products]);
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return myProducts;
		return myProducts.filter((p) => [p.title, p.vehicle, p.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
	}, [myProducts, query]);

	useEffect(() => {
		// expose router setter for dashboard CTA (no-op here)
		window.__setRoute = (r) => {};
		return () => {
			if (window.__setRoute) delete window.__setRoute;
		};
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold">Товары</h1>
					<p className="text-slate-600 text-sm">{supplierProfile?.companyName || "Моя компания"}</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="hidden sm:block text-sm text-slate-500">Всего: {myProducts.length}</div>
					<button className="btn primary" onClick={() => onCreateNavigate && onCreateNavigate()}>Добавить товар</button>
				</div>
			</div>

			<div className="card p-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<input className="input w-full" placeholder="Поиск по названию, авто, категории" value={query} onChange={(e) => setQuery(e.target.value)} />
					<button className="btn secondary" onClick={() => setQuery("")}>Сброс</button>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div className="card p-8 text-center">
					<div className="text-lg font-semibold mb-1">Пока нет товаров</div>
					<div className="text-sm text-slate-600 mb-4">Нажмите «Добавить товар», чтобы создать первый SKU</div>
					<button className="btn primary" onClick={() => onCreateNavigate && onCreateNavigate()}>Добавить товар</button>
				</div>
			) : (
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{filtered.map((p) => (
						<div key={p.id} className="card overflow-hidden">
							<div className="aspect-[4/3] bg-slate-100">
								<img src={p.img} alt={p.title} className="w-full h-full object-cover" />
							</div>
							<div className="p-4 space-y-2">
								<div className="flex items-start justify-between gap-2">
									<div className="font-medium line-clamp-2 min-h-[2.5rem]">{p.title}</div>
									<div className="text-sm font-semibold whitespace-nowrap">{new Intl.NumberFormat("ru-RU").format(p.price)} ₽</div>
								</div>
								<div className="text-xs text-slate-500">{p.vehicle || "Любое авто"}</div>
								<div className="flex items-center justify-between pt-2">
									<span className="chip">{p.category || "Misc"}</span>
									<button className="btn ghost text-xs cursor-not-allowed opacity-50">Редактировать</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

		</div>
	);
}

export { addSupplierProductPure };


