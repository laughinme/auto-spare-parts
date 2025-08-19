import React from "react";

export default function SupplierDashboard({ supplierProfile, metrics }) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Панель поставщика</h1>
					<p className="text-slate-600 text-sm">{supplierProfile?.companyName || "Моя компания"} • {supplierProfile?.city || "—"} • {supplierProfile?.addressLine1 || "Адрес не указан"}</p>
				</div>
				<div className="flex gap-2">
					<span className="chip chip--active">Сегодня</span>
					<span className="chip">7 дней</span>
					<span className="chip">30 дней</span>
				</div>
			</div>

			<div className="grid sm:grid-cols-5 gap-4">
				<KPICard label="GMV" value={`${new Intl.NumberFormat("ru-RU").format(metrics.gmv)} ₽`} />
				<KPICard label="Заказы" value={metrics.orders} />
				<KPICard label="Ожидает отправки" value={metrics.pending} />
				<KPICard label="Товары" value={metrics.mySkus} />
				<KPICard label="Конверсия" value={`${metrics.conv}%`} />
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				<div className="card p-4">
					<div className="font-semibold mb-3">Динамика заказов</div>
					<div className="h-40 grid grid-cols-12 items-end gap-2">
						{Array.from({ length: 12 }).map((_, i) => (
							<div key={i} className="bg-sky-500 rounded-t-md" style={{ height: `${20 + (i * 5) % 80}%` }} />
						))}
					</div>
					<div className="text-xs text-slate-500 mt-2">Прототипная диаграмма (данные мок).</div>
				</div>
				<div className="card p-4">
					<div className="font-semibold mb-3">Конверсия карточек → заказ</div>
					<div className="text-4xl font-semibold">{metrics.conv}%</div>
					<div className="text-sm text-slate-600">Простая метрика, легко считается на бэке: orders / product_views × 100.</div>
				</div>
			</div>

			<div className="card p-4 flex items-center justify-between">
				<div>
					<div className="font-semibold">Перейти к управлению товарами</div>
					<div className="text-sm text-slate-600">Добавляйте новые позиции, редактируйте цены и остатки.</div>
				</div>
				<a className="btn primary" href="#" onClick={(e) => { e.preventDefault(); window.__setRoute && window.__setRoute("supplier:products"); }}>Открыть товары →</a>
			</div>
		</div>
	);
}

function KPICard({ label, value }) {
	return (
		<div className="card p-4">
			<div className="text-xs text-slate-500">{label}</div>
			<div className="text-xl font-semibold">{value}</div>
		</div>
	);
}


