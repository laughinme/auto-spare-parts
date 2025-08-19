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

export default function SupplierProducts({ products, setProducts, supplierProfile }) {
	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("");
	const [category, setCategory] = useState("Engine");
	const [vehicle, setVehicle] = useState("");
	const [img, setImg] = useState("");
	const [shipEtaDays, setShipEtaDays] = useState(12);

	const myProducts = useMemo(() => products.filter((p) => p.supplierId === SUPPLIER_SELF_ID), [products]);

	const addSku = () => {
		const next = addSupplierProductPure(products, supplierProfile, { title, price, category, vehicle, img, shipEtaDays });
		setProducts(next);
		setTitle(""); setPrice(""); setVehicle(""); setImg(""); setShipEtaDays(12);
	};

	useEffect(() => {
		// expose router setter for dashboard CTA
		window.__setRoute = (r) => {};
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Товары</h1>
					<p className="text-slate-600 text-sm">{supplierProfile?.companyName || "Моя компания"}</p>
				</div>
				<div className="text-sm text-slate-500">Всего: {myProducts.length}</div>
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				<div className="card p-4">
					<div className="font-semibold mb-2">Добавить товар</div>
					<div className="grid grid-cols-2 gap-3">
						<input className="input col-span-2" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
						<input className="input" placeholder="Цена, ₽" value={price} onChange={(e) => setPrice(e.target.value)} />
						<input className="input" placeholder="Категория" value={category} onChange={(e) => setCategory(e.target.value)} />
						<input className="input col-span-2" placeholder="Авто / совместимость" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
						<input className="input col-span-2" placeholder="URL фото (опц.)" value={img} onChange={(e) => setImg(e.target.value)} />
						<input className="input" placeholder="ETA дней" type="number" value={shipEtaDays} onChange={(e) => setShipEtaDays(parseInt(e.target.value || "12", 10))} />
						<button className="btn primary col-span-2" onClick={addSku} disabled={!title || !price}>Сохранить SKU</button>
					</div>
				</div>

				<div className="card p-4">
					<div className="font-semibold mb-2">Мои товары ({myProducts.length})</div>
					<div className="divide-y">
						{myProducts.map((p) => (
							<div key={p.id} className="py-3 flex items-center gap-3">
								<img src={p.img} className="w-14 h-10 object-cover rounded-lg" />
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">{p.title}</div>
									<div className="text-xs text-slate-500 truncate">{p.category} • {p.vehicle}</div>
								</div>
								<div className="text-sm font-semibold">{new Intl.NumberFormat("ru-RU").format(p.price)} ₽</div>
							</div>
						))}
						{myProducts.length === 0 && <div className="text-sm text-slate-500">Пока нет товаров. Добавьте первый SKU.</div>}
					</div>
				</div>
			</div>
		</div>
	);
}

export { addSupplierProductPure };


