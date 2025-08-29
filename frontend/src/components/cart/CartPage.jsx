import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "../../utils/helpers.js";
import ProductCard from "../product/ProductCard.jsx";
import { getCart, updateCartItem, removeCartItem } from "../../api/api.js";

export default function CartPage({ onCheckout, onCartChanged, onViewProduct }) {
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    staleTime: 0,
  });

  const items = data?.items ?? [];

  // Используем тотал с сервера, а если вдруг нет — считаем локально
  const total =
    typeof data?.total_amount === "number"
      ? data.total_amount
      : items.reduce((sum, it) => sum + (Number(it?.unit_price) || 0) * (Number(it?.quantity) || 0), 0);

  // product.id -> item.id (для апдейтов/удалений)
  const productToItemId = React.useMemo(() => {
    const m = new Map();
    items.forEach((it) => {
      if (it?.product?.id) m.set(it.product.id, it.id);
    });
    return m;
  }, [items]);

  const mUpdate = useMutation({
    mutationFn: ({ productId, qty }) => {
      const item_id = productToItemId.get(productId);
      if (!item_id) return Promise.resolve(); // страховка
      return updateCartItem({ item_id, quantity: Math.max(1, qty) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      onCartChanged?.();
    },
  });

  const mRemove = useMutation({
    mutationFn: ({ productId }) => {
      const item_id = productToItemId.get(productId);
      if (!item_id) return Promise.resolve();
      return removeCartItem({ item_id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      onCartChanged?.();
    },
  });

  const updateQty = (productId, qty) => mUpdate.mutate({ productId, qty });
  const remove = (productId) => mRemove.mutate({ productId });

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600">Загружаем корзину...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-red-600">Не удалось загрузить корзину</h2>
        <p className="text-slate-600 mt-1">{error?.message || "Попробуйте обновить страницу."}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl">🧺</div>
        <h2 className="text-xl font-semibold mt-3">Ваша корзина пуста</h2>
        <p className="text-slate-600">Добавьте товары из FYP или поиска.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card">
        <div className="p-4 border-b font-semibold">Товары</div>
        <div>
          {items.map((line) => {
            const p = line?.product || {};
            const productForView = {
              ...p,
              // гарантируем наличие цены/картинки/титула для карточки
              price: Number(line?.unit_price) || 0,
              media: p.media || [],
              img: p.media?.[0]?.url,
              title: p.title || `${p.make?.make_name || ""} ${p.part_number || ""}`.trim(),
              part_number: p.part_number,
              condition: p.condition || "new",
            };
            return (
              <ProductCard
                key={p.id}
                product={productForView}
                variant="cart"
                quantity={Number(line?.quantity) || 1}
                onUpdateQuantity={updateQty}
                onRemove={remove}
                onView={(prod) => onViewProduct && onViewProduct(prod)}
              />
            );
          })}
        </div>
      </div>

      <div className="card p-4 h-fit">
        <div className="font-semibold mb-2">Итого</div>
        <div className="flex justify-between text-sm">
          <span>Товары</span>
          <span>{formatPrice(total)} ₽</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Комиссия и доставка</span>
          <span>Рассчитаем на шаге оплаты</span>
        </div>
        <button
          className="btn primary w-full mt-4"
          onClick={onCheckout}
          disabled={mUpdate.isPending || mRemove.isPending}
        >
          Перейти к оформлению
        </button>
        <p className="text-xs text-slate-500 mt-2">
          Оплата в ₽, средства удерживаются до отправки продавцом.
        </p>
      </div>
    </div>
  );
}
