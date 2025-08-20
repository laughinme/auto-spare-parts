import React, { useEffect, useState } from "react";
import { getProducts } from '../../api/api.js';
import { useDebounce } from '../../hooks/useDebounce'; 
import { useQuery } from '@tanstack/react-query';

export default function SupplierProducts({ orgId, onCreateNavigate }) {
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query, 500);

	useEffect(() => {
		window.__setRoute = () => {};
		return () => {
			if (window.__setRoute) delete window.__setRoute;
		};
	}, []);


 const { data, isLoading, isError, error } = useQuery({
        queryKey: ['products', orgId, debouncedQuery],
        queryFn: () => getProducts({ orgId, query: debouncedQuery }),
        enabled: !!orgId,
        onSuccess: (data) => {
            console.log('Products API response:', data);
        },
        onError: (error) => {
            console.error('Products API error:', error);
        }
    });

    if (isLoading) {
        return <div>Загрузка товаров...</div>;
    }

    if (isError) {
        return <div>Ошибка при загрузке товаров: {error.message}</div>;
    }

    const products = data?.items || [];
    const totalProducts = data?.total || 0;

    console.log('SupplierProducts debug:', {
        orgId,
        debouncedQuery,
        hasData: !!data,
        productsCount: products.length,
        totalProducts
    });

	return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Товары</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-sm text-slate-500">Всего: {totalProducts}</div>
                    <button className="btn primary" onClick={() => onCreateNavigate && onCreateNavigate()}>Добавить товар</button>
                </div>
            </div>

            <div className="card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <input className="input w-full" placeholder="Поиск по названию, авто, категории" value={query} onChange={(e) => setQuery(e.target.value)} />
                    <button className="btn secondary" onClick={() => setQuery("")}>Сброс</button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="card p-8 text-center">
                    <div className="text-lg font-semibold mb-1">{query ? 'Ничего не найдено' : 'Пока нет товаров'}</div>
                    <div className="text-sm text-slate-600 mb-4">{query ? 'Попробуйте другой поисковый запрос' : 'Нажмите «Добавить товар», чтобы создать первый'}</div>
                    <button className="btn primary" onClick={() => onCreateNavigate && onCreateNavigate()}>Добавить товар</button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <div key={p.id} className="card overflow-hidden">
                            <div className="aspect-[4/3] bg-slate-100">
                                <img 
                                    src={p.media?.[0]?.url || "https://via.placeholder.com/400x300"} 
                                    alt={p.brand} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="font-medium line-clamp-2 min-h-[2.5rem]">{p.brand} ({p.part_number})</div>
                                    <div className="text-sm font-semibold whitespace-nowrap">{new Intl.NumberFormat("ru-RU").format(p.price)} ₽</div>
                                </div>
                                <div className="text-xs text-slate-500 line-clamp-2">{p.description || "Нет описания"}</div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="chip">{p.condition === 'new' ? 'Новый' : 'Б/У'}</span>
                                    <button className="btn ghost text-xs cursor-not-allowed opacity-50">Редактировать</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}