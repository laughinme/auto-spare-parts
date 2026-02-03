import React, { useState, useEffect, useMemo } from "react";

export default function AdvancedFilters({ onFiltersChange, initialFilters = {} }) {

  const [query, setQuery] = useState(initialFilters.query || "");
  const [brand, setBrand] = useState(initialFilters.brand || "");
  const [condition, setCondition] = useState(initialFilters.condition || "");
  const [priceRange, setPriceRange] = useState({
    min: initialFilters.price_min || "",
    max: initialFilters.price_max || ""
  });


  const [isExpanded, setIsExpanded] = useState(false);


  const filters = useMemo(() => ({
    q: query || undefined,
    brand: brand || undefined,
    condition: condition || undefined,
    price_min: priceRange.min ? parseFloat(priceRange.min) : undefined,
    price_max: priceRange.max ? parseFloat(priceRange.max) : undefined
  }), [query, brand, condition, priceRange]);

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const clearFilters = () => {
    setQuery("");
    setBrand("");
    setCondition("");
    setPriceRange({ min: "", max: "" });
  };

  const hasFilters = query || brand || condition || priceRange.min || priceRange.max;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
			{}
			<div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
							<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
							</svg>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-slate-900">Умный поиск запчастей</h3>
							<p className="text-sm text-slate-600">Найдите именно то, что нужно для вашего автомобиля</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{hasFilters &&
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors">

								Очистить
							</button>
            }
						<button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-white/50 rounded-lg transition-colors">

							{isExpanded ? "Свернуть" : "Развернуть"}
							<svg
                className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">

								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
					</div>
				</div>
			</div>
			
			{}
			<div className="p-4">
				<div className="relative">
					<div className="absolute left-3 top-1/2 -translate-y-1/2">
						<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<input
            type="text"
            placeholder="Поиск по названию детали, артикулу или описанию..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />

				</div>
			</div>
			
			{}
			<div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
				<div className="px-4 pb-4 space-y-4 border-t border-slate-100 bg-slate-50/50">
					<div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-slate-700">Марка/Бренд</label>
							<input
                type="text"
                placeholder="Например: BMW, Bosch, Febi..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />

						</div>
						
						{}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-slate-700">Состояние</label>
							<select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">

								<option value="">Любое состояние</option>
								<option value="new">Новая</option>
								<option value="used">Б/у</option>
							</select>
						</div>
						
						{}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-slate-700">Цена, USD</label>
							<div className="flex gap-2">
								<input
                  type="number"
                  placeholder="От"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />

								<input
                  type="number"
                  placeholder="До"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />

							</div>
						</div>
					</div>
					
					{}
					{hasFilters &&
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
							<div className="text-sm text-blue-800">
								<span className="font-medium">Активные фильтры:</span>
								<div className="flex flex-wrap gap-1 mt-2">
									{query && <span className="px-2 py-1 bg-blue-100 rounded-full text-xs">Поиск: "{query}"</span>}
									{brand && <span className="px-2 py-1 bg-blue-100 rounded-full text-xs">Бренд: {brand}</span>}
									{condition && <span className="px-2 py-1 bg-blue-100 rounded-full text-xs">Состояние: {condition}</span>}
									{(priceRange.min || priceRange.max) &&
                <span className="px-2 py-1 bg-blue-100 rounded-full text-xs">
											Цена: {priceRange.min || "0"} - {priceRange.max || "∞"} USD
										</span>
                }
								</div>
							</div>
						</div>
          }
				</div>
			</div>
		</div>);

}