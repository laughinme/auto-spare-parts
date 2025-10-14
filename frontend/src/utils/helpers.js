// Shared pure helpers

export const formatPrice = (num) => new Intl.NumberFormat("ru-RU").format(num);

/** Group cart lines by supplier and create order shells. */
export function createOrdersFromCart(cart, productsById = {}) {
	if (!Array.isArray(cart)) return [];
	const groups = {};
	const now = Date.now();

	for (const line of cart) {
		const product =
			line?.product ||
			(line?.productId ? productsById[line.productId] : undefined);
		if (!product) continue;

		const supplierId =
			line?.seller_org_id ||
			product.organization?.id ||
			product.supplierId ||
			"default_supplier";
		const supplierName =
			product.organization?.name ||
			product.supplierName ||
			"Поставщик";

		const productId = product.id || line?.productId;
		if (!productId) continue;

		const quantity = Math.max(1, Number(line?.quantity ?? line?.qty ?? 1));
		const unitPrice = Number(line?.unit_price ?? product.price ?? 0) || 0;
		const title = product.title || line?.title || `Товар ${productId}`;

		if (!groups[supplierId]) {
			groups[supplierId] = { supplierId, supplierName, items: [] };
		}

		groups[supplierId].items.push({
			productId,
			qty: quantity,
			price: unitPrice,
			title,
		});
	}

	return Object.values(groups).map((group, idx) => ({
		id: `ord-${now}-${idx + 1}`,
		...group,
		chat: [
			{
				id: "m1",
				author: "system",
				text: "Чат открыт. Свяжитесь с продавцом для уточнения деталей.",
				ts: new Date().toISOString(),
			},
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

