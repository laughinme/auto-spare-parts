import React, { useMemo, useState, useEffect } from "react";
import AdvancedFilters from "./AdvancedFilters.jsx";
import { QUICK_TAGS } from "../../data/constants.js";
import ProductCard from "../product/ProductCard.jsx";
import { searchProducts, getProductsFeed } from "../../api/api.js";

export default function FYP({ role, buyerType, garage, onAddVehicle, onRemoveVehicle, setSelectedProduct, navigateTo, onAddToCart }) {
	// Filter states
	const [filters, setFilters] = useState({});
	const [tag, setTag] = useState(null);
	
	// Data states
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [hasMoreProducts, setHasMoreProducts] = useState(true);
	const [cursor, setCursor] = useState(null);
	
	// Load products when filters change
	useEffect(() => {
		const loadProducts = async () => {
			setLoading(true);
			setError(null);
			
			try {
				// Combine filters with category tag if selected
				const searchParams = {
					...filters,
					// If tag is selected, add it to search query
					q: tag ? `${filters.q || ""} ${tag}`.trim() : filters.q,
					limit: 20
				};
				
				// Use search API if any filters are applied, otherwise use feed
				const hasFilters = Object.values(searchParams).some(value => 
					value !== undefined && value !== "" && value !== null
				);
				
				let result;
				if (hasFilters) {
					result = await searchProducts(searchParams);
				} else {
					result = await getProductsFeed({ limit: 20 });
				}
				
				setProducts(result.items || []);
				setHasMoreProducts(!!result.next_cursor);
				setCursor(result.next_cursor);
			} catch (err) {
				console.error("Failed to load products:", err);
				setError("Не удалось загрузить продукты. Попробуйте еще раз.");
				setProducts([]);
			} finally {
				setLoading(false);
			}
		};
		
		loadProducts();
	}, [filters, tag]);
	
	// Load more products (infinite scroll)
	const loadMoreProducts = async () => {
		if (!hasMoreProducts || loading || !cursor) return;
		
		setLoading(true);
		try {
			const searchParams = {
				...filters,
				q: tag ? `${filters.q || ""} ${tag}`.trim() : filters.q,
				limit: 20,
				cursor
			};
			
			const hasFilters = Object.values(searchParams).some(value => 
				value !== undefined && value !== "" && value !== null
			);
			
			let result;
			if (hasFilters) {
				result = await searchProducts(searchParams);
			} else {
				result = await getProductsFeed({ limit: 20, cursor });
			}
			
			setProducts(prev => [...prev, ...(result.items || [])]);
			setHasMoreProducts(!!result.next_cursor);
			setCursor(result.next_cursor);
		} catch (err) {
			console.error("Failed to load more products:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Advanced Filters */}
			<AdvancedFilters onFiltersChange={setFilters} />

			<div className="flex flex-col lg:flex-row gap-6">
				{/* Left: feed */}
				<div className="flex-1 min-w-0">
					<div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">Лента запчастей</h1>
							{role === "buyer" && buyerType === "private" && (
								<p className="text-slate-600 text-sm">{garage?.length ? `Ваш авто в гараже: ${garage[0]}` : "Добавьте авто в гараже для точных рекомендаций."}</p>
							)}
							{role === "buyer" && buyerType === "workshop" && (
								<p className="text-slate-600 text-sm">Режим мастерской: подбирайте детали под запрос клиента.</p>
							)}
						</div>
						<div className="flex flex-wrap gap-2">
							{QUICK_TAGS.map((t) => (
								<button 
									key={t} 
									className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
										tag === t 
											? "bg-blue-600 text-white border-blue-600 shadow-sm transform scale-105" 
											: "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
									}`} 
									onClick={() => setTag(tag === t ? null : t)}
								>
									{t}
								</button>
							))}
						</div>
					</div>

					{/* Error state */}
					{error && (
						<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
							<div className="flex items-center gap-2">
								<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span className="text-red-800">{error}</span>
							</div>
						</div>
					)}

					{/* Products grid */}
					<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
						{products.map((p) => (
							<ProductCard
								key={p.id}
								product={p}
								variant="catalog"
								onView={(product) => { setSelectedProduct(product); navigateTo("product"); }}
								onAddToCart={onAddToCart}
							/>
						))}
					</div>

					{/* Loading state */}
					{loading && products.length === 0 && (
						<div className="flex items-center justify-center py-12">
							<div className="flex items-center gap-3">
								<div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
								<span className="text-slate-600">Загружаем запчасти...</span>
							</div>
						</div>
					)}

					{/* Empty state */}
					{!loading && products.length === 0 && !error && (
						<div className="text-center py-12">
							<div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
								<svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<h3 className="text-lg font-medium text-slate-900 mb-2">Запчасти не найдены</h3>
							<p className="text-slate-600">Попробуйте изменить фильтры или поисковый запрос</p>
						</div>
					)}

					{/* Load more button */}
					{hasMoreProducts && products.length > 0 && (
						<div className="text-center mt-8">
							<button
								onClick={loadMoreProducts}
								disabled={loading}
								className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{loading ? (
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										Загружаем...
									</div>
								) : (
									"Загрузить ещё"
								)}
							</button>
						</div>
					)}
				</div>

				{/* Right: Garage widget (private buyers only) */}
				{role === "buyer" && buyerType === "private" && (
					<div className="w-full lg:w-[360px] shrink-0">
						<GarageWidget garage={garage} onAdd={onAddVehicle} onRemove={onRemoveVehicle} />
					</div>
				)}
			</div>
		</div>
	);
}

function GarageWidget({ garage, onAdd, onRemove }) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	return (
		<div className="card p-4">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm uppercase tracking-wider text-slate-600">Гараж</div>
					<div className="text-lg font-semibold">Ваши автомобили</div>
				</div>
				<button className="btn primary" onClick={() => setOpen((v) => !v)}>{open ? "Скрыть" : "Добавить"}</button>
			</div>
			{open && (
				<div className="mt-3 flex gap-2">
					<input className="input flex-1" placeholder="Марка/модель/год или VIN" value={value} onChange={(e) => setValue(e.target.value)} />
					<button className="btn secondary" onClick={() => { if ((value||"").trim()) { onAdd(value); setValue(""); } }}>Сохранить</button>
				</div>
			)}
			<div className="mt-3 space-y-2">
				{garage.map((g) => (
					<div key={g} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
						<div className="truncate pr-2">{g}</div>
						<button className="btn ghost" onClick={() => onRemove(g)}>Удалить</button>
					</div>
				))}
				{garage.length === 0 && <div className="text-sm text-slate-500">Гараж пуст. Добавьте ваше авто для точного подбора.</div>}
			</div>
		</div>
	);
}


