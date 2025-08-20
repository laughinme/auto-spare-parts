// Shared pure helpers

export const formatPrice = (num) => new Intl.NumberFormat("ru-RU").format(num);

/** Group cart lines by supplier and create order shells. */
export function createOrdersFromCart(cart, productsById) {
	if (!Array.isArray(cart)) return [];
	const groups = {};
	for (const line of cart) {
		const p = productsById[line.productId];
		if (!p) continue;
		if (!groups[p.supplierId]) groups[p.supplierId] = { supplierId: p.supplierId, supplierName: p.supplierName, items: [] };
		groups[p.supplierId].items.push({ ...line, price: p.price, title: p.title });
	}
	return Object.values(groups).map((g, idx) => ({
		id: `ord-${Date.now()}-${idx + 1}`,
		...g,
		chat: [
			{ id: "m1", author: "system", text: "Чат открыт. Свяжитесь с продавцом для уточнения деталей.", ts: new Date().toISOString() },
		],
		status: "Новый",
	}));
}

/** Garage is enabled only for private buyers. */
export function isGarageEnabled(buyerType) { return buyerType === "private"; }

/** VIN validation: 17 chars, excludes I,O,Q */
export function validateVIN(vin) {
	const v = String(vin || "").trim().toUpperCase();
	if (v.length !== 17) return false;
	return /^[A-HJ-NPR-Z0-9]{17}$/.test(v);
}

export function bubbleCls(author) {
	// Keep green for tests (chat only), while the overall UI uses blue
	if (author === "buyer") return "bg-emerald-600 text-white";
	if (author === "seller") return "bg-slate-100";
	return "bg-amber-100"; // system
}


