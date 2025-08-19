import React from "react";
import { formatPrice } from "../../utils/helpers.js";

export default function ProductDetail({ product, onAdd, onBack, onChat }) {
	return (
		<div className="grid lg:grid-cols-2 gap-6">
			<div className="card overflow-hidden">
				<img src={product.img} className="w-full h-[380px] object-cover" />
			</div>
			<div className="card p-6">
				<button className="text-sm text-slate-500 hover:underline" onClick={onBack}>← Назад</button>
				<h1 className="text-2xl font-semibold mt-2">{product.title}</h1>
				<div className="text-sm text-slate-600 mt-1">{product.vehicle} • {product.supplierName}</div>
				<div className="text-xl font-semibold mt-4">{formatPrice(product.price)} ₽</div>
				<div className="text-sm text-slate-500">Срок доставки ~{product.shipEtaDays} дней</div>
				<div className="flex gap-2 mt-6">
					<button className="btn primary" onClick={onAdd}>В корзину</button>
					<button className="btn secondary" onClick={onChat}>Чат с продавцом</button>
				</div>
				<div className="mt-6">
					<h3 className="font-semibold mb-2">Описание</h3>
					<p className="text-sm text-slate-600">Состояние: {product.condition === "new" ? "новая" : "б/у"}. Совместимость по указанной модели. При оформлении заказа можно уточнить VIN.</p>
				</div>
			</div>
		</div>
	);
}


