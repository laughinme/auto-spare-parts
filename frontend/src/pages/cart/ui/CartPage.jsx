import React from "react";
import { formatPrice } from "../../../shared/lib/helpers.js";
import { CartItemRow } from "../../../entities/cart/ui/CartItemRow.jsx";

export default function CartPage({ cart, isLoading, isMutating, onUpdateQuantity, onRemoveItem, onCheckout }) {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const totalAmount = Number(cart?.total_amount ?? 0) || 0;
  const totalItems = cart?.total_items ?? 0;

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
				<div className="flex items-center gap-3">
					<div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
					<span>Загружаем корзину...</span>
				</div>
			</div>);

  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
				<div className="text-4xl">🧺</div>
				<h2 className="text-xl font-semibold mt-3">Ваша корзина пуста</h2>
				<p className="text-slate-600">Добавьте товары из FYP или поиска.</p>
			</div>);

  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2 card overflow-hidden">
				<div className="p-4 border-b font-semibold flex items-center justify-between">
					<span>Товары</span>
					<span className="text-sm text-slate-500">{totalItems} шт.</span>
				</div>
				<div>
					{items.map((item) =>
          <CartItemRow
            key={item.id}
            item={item}
            disabled={isMutating}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem} />

          )}
				</div>
				{isLoading &&
        <div className="p-4 text-sm text-slate-500 border-t">Обновляем корзину...</div>
        }
			</div>
			<div className="card p-4 h-fit">
				<div className="font-semibold mb-2">Итого</div>
				<div className="flex justify-between text-sm">
					<span>Товары</span>
					<span>{formatPrice(totalAmount)} ₽</span>
				</div>
				<div className="flex justify-between text-sm text-slate-500">
					<span>Комиссия и доставка</span>
					<span>Рассчитаем на шаге оплаты</span>
				</div>
				<button
          className="btn primary w-full mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onCheckout}
          disabled={isMutating || isLoading || !items.length}>

					{isMutating ? "Обновляем..." : "Перейти к оформлению"}
				</button>
				<p className="text-xs text-slate-500 mt-2">Оплата в ₽, средства удерживаются до отправки продавцом.</p>
				{isMutating && <p className="text-xs text-slate-400 mt-1">Подождите, сохраняем изменения...</p>}
			</div>
		</div>);

}