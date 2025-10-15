import React from "react";
import { formatPrice } from "../../../shared/lib/helpers.js";
import ChatPanel from "../../../entities/chat/ui/ChatPanel.jsx";

export default function OrderPage({ order, onBack, onSend }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2 card">
				<div className="p-4 border-b flex items-center justify-between">
					<div>
						<button className="text-sm text-slate-500 hover:underline" onClick={onBack}>← К ленте</button>
						<div className="font-semibold">Заказ {order.id}</div>
						<div className="text-sm text-slate-500">Поставщик: {order.supplierName} • Статус: {order.status}</div>
					</div>
				</div>
				<div>
					{order.items.map((it) =>
          <div key={it.productId} className="p-4 border-b last:border-0 flex items-center justify-between">
							<div className="max-w-[70%]">
								<div className="font-medium line-clamp-1">{it.title}</div>
								<div className="text-sm text-slate-500">Кол-во: {it.qty}</div>
							</div>
							<div className="font-medium">{formatPrice(it.price * it.qty)} ₽</div>
						</div>
          )}
				</div>
			</div>

			<div className="lg:col-span-1">
				<ChatPanel order={order} onSend={onSend} />
			</div>
		</div>);

}