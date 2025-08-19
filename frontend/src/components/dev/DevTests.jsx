import React, { useMemo } from "react";
import { createOrdersFromCart, bubbleCls, isGarageEnabled, validateVIN } from "../../utils/helpers.js";
import { MOCK_PRODUCTS } from "../../data/mockProducts.js";
import { SUPPLIER_SELF_ID } from "../../data/constants.js";
import { addSupplierProductPure } from "../supplier/SupplierProducts.jsx";

export default function DevTests() {
	const results = useMemo(() => runTests(), []);
	const passCount = results.filter((r) => r.pass).length;
	return (
		<div className="max-w-3xl mx-auto">
			<h2 className="text-2xl font-semibold mb-4">Dev Tests</h2>
			<div className="card divide-y">
				{results.map((r) => (
					<div key={r.name} className="p-4 flex items-start justify-between">
						<div>
							<div className="font-medium">{r.name}</div>
							{r.details && <div className="text-xs text-slate-500 mt-1">{r.details}</div>}
						</div>
						<div className={`px-2 py-1 rounded-md text-xs ${r.pass ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{r.pass ? "PASS" : "FAIL"}</div>
					</div>
				))}
			</div>
			<div className="mt-3 text-sm text-slate-600">Passed {passCount}/{results.length} tests.</div>
		</div>
	);
}

function runTests() {
	const tests = [];

	// Test 1: createOrdersFromCart splits by supplier and seeds chat/status
	tests.push(() => {
		const cart = [
			{ productId: "p1", qty: 1 }, // s1
			{ productId: "p2", qty: 2 }, // s2
			{ productId: "p3", qty: 1 }, // s1
		];
		const productsById = Object.fromEntries(MOCK_PRODUCTS.map((p) => [p.id, p]));
		const orders = createOrdersFromCart(cart, productsById);
		const pass = orders.length === 2 &&
			orders.some((o) => o.supplierId === "s1" && o.items.length === 2) &&
			orders.some((o) => o.supplierId === "s2" && o.items.length === 1) &&
			orders.every((o) => o.chat && o.chat.length === 1 && o.status === "Новый");
		return { name: "Split cart by supplier & seed chat", pass, details: JSON.stringify(orders.map(o => ({ id: o.id, sid: o.supplierId, items: o.items.length }))) };
	});

	// Test 2: bubbleCls mapping
	tests.push(() => {
		const pass = bubbleCls("buyer").includes("emerald") && bubbleCls("seller").includes("slate") && bubbleCls("system").includes("amber");
		return { name: "bubbleCls returns expected classes", pass };
	});

	// Test 3: isGarageEnabled logic
	tests.push(() => {
		const pass = isGarageEnabled("private") === true && isGarageEnabled("workshop") === false;
		return { name: "Garage enabled only for private buyers", pass };
	});

	// Test 4: addSupplierProductPure adds product with supplier self and groups correctly
	tests.push(() => {
		const products = [...MOCK_PRODUCTS];
		const supplierProfile = { companyName: "MyCo" };
		const next = addSupplierProductPure(products, supplierProfile, { title: "Test SKU", price: 9999, category: "Engine", vehicle: "Any" });
		const added = next[next.length - 1];
		const cart = [{ productId: added.id, qty: 3 }];
		const byId = Object.fromEntries(next.map((p) => [p.id, p]));
		const orders = createOrdersFromCart(cart, byId);
		const pass = next.length === products.length + 1 && added.supplierId === SUPPLIER_SELF_ID && orders.length === 1 && orders[0].supplierId === SUPPLIER_SELF_ID && orders[0].items[0].qty === 3;
		return { name: "Supplier add SKU & split by self", pass };
	});

	// Test 5: validateVIN
	tests.push(() => {
		const ok = validateVIN("WAUZZZ4G0CN000000");
		const badLen = !validateVIN("SHORTVIN123");
		const badChars = !validateVIN("IOQ00000000000000".slice(0,17));
		return { name: "VIN validator", pass: ok && badLen && badChars };
	});

	// Execute
	return tests.map((t) => {
		try { return t(); } catch (e) { return { name: "Unknown test", pass: false, details: String(e) }; }
	});
}


