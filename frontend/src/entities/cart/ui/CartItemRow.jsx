import React from "react";
import { formatPrice } from "../../../shared/lib/helpers.js";

const DEFAULT_PRODUCT_IMAGE =
"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'%3E%3Crect width='160' height='120' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' fill='%23678999' font-size='12' text-anchor='middle' dominant-baseline='middle'%3ENo%20image%3C/text%3E%3C/svg%3E";

export function CartItemRow({ item, disabled, onUpdateQuantity, onRemove }) {
  const product = item?.product || {};
  const quantity = Math.max(
    1,
    Number.isFinite(Number(item?.quantity)) ? Number(item.quantity) : 1
  );
  const image =
  product?.media?.[0]?.url || product?.img || DEFAULT_PRODUCT_IMAGE;
  const title = product?.title || item?.title || "Товар";
  const supplier =
  product?.organization?.name ||
  product?.supplierName ||
  product?.make?.make_name ||
  null;
  const unitPrice = Number(item?.unit_price ?? product?.price ?? 0) || 0;
  const totalPrice = unitPrice * quantity;

  const clamp = (value) => Math.max(1, Math.min(99, value));
  const handleInputChange = (event) => {
    const next = clamp(parseInt(event.target.value || "1", 10));
    if (onUpdateQuantity) onUpdateQuantity(item.id, next);
  };

  const handleDecrease = () => {
    if (disabled || quantity <= 1) return;
    if (onUpdateQuantity) onUpdateQuantity(item.id, clamp(quantity - 1));
  };

  const handleIncrease = () => {
    if (disabled) return;
    if (onUpdateQuantity) onUpdateQuantity(item.id, clamp(quantity + 1));
  };

  return (
    <div className="p-5 flex items-center gap-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-24 h-20 object-cover rounded-xl shadow-sm" />

        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
          {quantity}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 line-clamp-1 mb-1">
          {title}
        </div>
        {supplier && <div className="text-sm text-gray-600 mb-2">{supplier}</div>}
        <div className="text-xs text-gray-500">
          Артикул: {product?.part_number || "—"}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-lg">
          <button
            className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent"
            onClick={handleDecrease}
            disabled={disabled || quantity <= 1}>

            −
          </button>
          <input
            type="number"
            className="w-16 text-center border-0 py-1 text-sm font-medium focus:ring-0"
            value={quantity}
            min={1}
            max={99}
            onChange={handleInputChange}
            disabled={disabled} />

          <button
            className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent"
            onClick={handleIncrease}
            disabled={disabled}>

            +
          </button>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg text-gray-900">
            {formatPrice(totalPrice)} ₽
          </div>
            <div className="text-xs text-gray-500">
            {formatPrice(unitPrice)} ₽ за шт.
          </div>
        </div>
        <button
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:text-red-300 disabled:hover:bg-transparent"
          onClick={() => onRemove && onRemove(item.id)}
          title="Удалить из корзины"
          disabled={disabled}>

          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd" />

          </svg>
        </button>
      </div>
    </div>);

}