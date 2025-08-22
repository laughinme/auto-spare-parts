import React from "react";

export default function Topbar({ route, setRoute, role, cartCount, isWorkshop, showSupplierTab, onLogout }) {
	return (
		<header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-2xl bg-sky-600 shadow-lg shadow-sky-600/20" />
					<span className="font-semibold tracking-tight">PartsDubai</span>
					{role === "buyer" && isWorkshop && (
						<span className="ml-2 text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-900">СТО</span>
					)}
				</div>
				<nav className="hidden md:flex items-center gap-2 text-sm">
					<button className={navBtnCls(route === "fyp")} onClick={() => setRoute("fyp")}>Главная</button>
					<button className={navBtnCls(route === "cart")} onClick={() => setRoute("cart")}>Корзина{cartCount ? ` (${cartCount})` : ""}</button>
					<button className={navBtnCls(route === "chat")} onClick={() => setRoute("chat")}>Чат</button>
					{role === "buyer" && (
						<button className={navBtnCls(route === "garage")} onClick={() => setRoute("garage")}>Гараж</button>
					)}
					{showSupplierTab && (
						<div className="flex items-center gap-2">
							<button className={navBtnCls(route === "supplier:dashboard")} onClick={() => setRoute("supplier:dashboard")}>Панель</button>
							<button className={navBtnCls(route === "supplier:products")} onClick={() => setRoute("supplier:products")}>Товары</button>
						</div>
					)}
				</nav>
				<div className="flex items-center gap-2">
					<div className="text-xs text-slate-500">Роль: {role ?? "—"}</div>
					<button 
						className="px-3 py-2 rounded-xl border transition shadow-sm hover:shadow-md border-slate-200 bg-white text-xs" 
						onClick={() => onLogout && onLogout()}
					>
						Выйти
					</button>
				</div>
			</div>
		</header>
	);
}

function navBtnCls(active) {
	return "px-3 py-2 rounded-xl border transition shadow-sm hover:shadow-md " + (active ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 bg-white");
}


