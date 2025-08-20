import React from "react";
import { formatPrice } from "../../utils/helpers.js";

export default function CartPage({ cart, productsById, setCart, onCheckout }) {
	const total = cart.reduce((sum, line) => sum + productsById[line.productId].price * line.qty, 0);

	const updateQty = (id, qty) => setCart((prev) => prev.map((l) => (l.productId === id ? { ...l, qty: Math.max(1, qty) } : l)));
	const remove = (id) => setCart((prev) => prev.filter((l) => l.productId !== id));

	if (cart.length === 0) {
		return (
			<div className="text-center py-20">
				<div className="text-4xl">🧺</div>
				<h2 className="text-xl font-semibold mt-3">Ваша корзина пуста</h2>
				<p className="text-slate-600">Добавьте товары из FYP или поиска.</p>
			</div>
		);
	}

	return (
		<div className="grid lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2 card">
				<div className="p-4 border-b font-semibold">Товары</div>
				<div>
					{cart.map((line) => {
						const p = productsById[line.productId];
						return (
							<div key={line.productId} className="p-4 flex items-center gap-4 border-b last:border-0">
								<img src={p.img} className="w-24 h-16 object-cover rounded-lg" />
								<div className="flex-1">
									<div className="font-medium line-clamp-1">{p.title}</div>
									<div className="text-sm text-slate-500">{p.supplierName}</div>
								</div>
								<div className="flex items-center gap-2">
									<input type="number" className="input w-20" value={line.qty} onChange={(e) => updateQty(p.id, parseInt(e.target.value || "1", 10))} />
									<div className="w-24 text-right">{formatPrice(p.price * line.qty)} ₽</div>
									<button className="btn ghost" onClick={() => remove(p.id)}>Удалить</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
			<div className="card p-4 h-fit">
				<div className="font-semibold mb-2">Итого</div>
				<div className="flex justify-between text-sm"><span>Товары</span><span>{formatPrice(total)} ₽</span></div>
				<div className="flex justify-between text-sm text-slate-500"><span>Комиссия и доставка</span><span>Рассчитаем на шаге оплаты</span></div>
				<button className="btn primary w-full mt-4" onClick={onCheckout}>Перейти к оформлению</button>
				<p className="text-xs text-slate-500 mt-2">Оплата в ₽, средства удерживаются до отправки продавцом.</p>
			</div>
		</div>
	);
}


