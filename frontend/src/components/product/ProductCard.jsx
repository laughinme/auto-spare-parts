import React from "react";
import { formatPrice } from "../../utils/helpers.js";

/**
 * Универсальный компонент карточки товара
 * Поддерживает разные варианты отображения: каталог, поставщик, корзина
 */
export default function ProductCard({ 
  product, 
  variant = "catalog", // "catalog", "supplier", "cart"
  quantity, // для варианта "cart"
  onView,     // для просмотра деталей товара
  onAddToCart, // для добавления в корзину
  onEdit,     // для редактирования (поставщик)
  onUpdateQuantity, // для изменения количества в корзине
  onRemove,   // для удаления из корзины
  className = ""
}) {
  // Функция для получения изображения товара в зависимости от структуры данных
  const getProductImage = () => {
    if (product.img) return product.img;
    if (product.media?.[0]?.url) return product.media[0].url;
    return "https://via.placeholder.com/400x300";
  };

  // Функция для получения названия товара
  const getProductTitle = () => {
    if (product.title) return product.title;
    if (product.brand && product.part_number) return `${product.brand} (${product.part_number})`;
    return product.brand || "Без названия";
  };

  // Функция для получения описания товара
  const getProductDescription = () => {
    if (variant === "supplier") {
      return product.description || "Нет описания";
    }
    return null;
  };

  // Функция для получения информации о поставщике
  const getSupplierInfo = () => {
    if (product.supplierName) {
      const condition = product.condition === "new" ? "Новая" : "Б/у";
      return `${product.supplierName} • ${condition}`;
    }
    return null;
  };

  // Функция для получения информации о доставке
  const getShippingInfo = () => {
    if (product.shipEtaDays) {
      return `Доставка ~${product.shipEtaDays} дн.`;
    }
    return null;
  };

  // Рендер варианта для корзины
  if (variant === "cart") {
    return (
      <div className={`p-4 flex items-center gap-4 border-b last:border-0 ${className}`}>
        <img 
          src={getProductImage()} 
          alt={getProductTitle()}
          className="w-24 h-16 object-cover rounded-lg" 
        />
        <div className="flex-1">
          <div className="font-medium line-clamp-1">{getProductTitle()}</div>
          <div className="text-sm text-slate-500">{product.supplierName}</div>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            className="input w-20" 
            value={quantity} 
            onChange={(e) => onUpdateQuantity && onUpdateQuantity(product.id, parseInt(e.target.value || "1", 10))} 
          />
          <div className="w-24 text-right">{formatPrice(product.price * quantity)} ₽</div>
          <button className="btn ghost" onClick={() => onRemove && onRemove(product.id)}>
            Удалить
          </button>
        </div>
      </div>
    );
  }

  // Рендер варианта для поставщика
  if (variant === "supplier") {
    return (
      <div className={`card overflow-hidden ${className}`}>
        <div className="aspect-[4/3] bg-slate-100">
          <img 
            src={getProductImage()} 
            alt={getProductTitle()}
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium line-clamp-2 min-h-[2.5rem]">{getProductTitle()}</div>
            <div className="text-sm font-semibold whitespace-nowrap">{formatPrice(product.price)} ₽</div>
          </div>
          {getProductDescription() && (
            <div className="text-xs text-slate-500 line-clamp-2">{getProductDescription()}</div>
          )}
          <div className="flex items-center justify-between pt-2">
            <span className="chip">{product.condition === 'new' ? 'Новый' : 'Б/У'}</span>
            <button 
              className="btn ghost text-xs cursor-not-allowed opacity-50"
              onClick={() => onEdit && onEdit(product)}
            >
              Редактировать
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Рендер варианта для каталога (по умолчанию)
  return (
    <div className={`card ${className}`}>
      <div className="aspect-[16/10] bg-slate-100">
        <img 
          src={getProductImage()} 
          alt={getProductTitle()}
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-4">
        {product.vehicle && (
          <div className="text-sm text-slate-500">{product.vehicle}</div>
        )}
        <div className="font-semibold mt-1 line-clamp-2">{getProductTitle()}</div>
        {getSupplierInfo() && (
          <div className="text-sm text-slate-500 mt-1">{getSupplierInfo()}</div>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="text-lg font-semibold">{formatPrice(product.price)} ₽</div>
          {getShippingInfo() && (
            <div className="text-xs text-slate-500">{getShippingInfo()}</div>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <button 
            className="btn secondary" 
            onClick={() => onView && onView(product)}
          >
            Подробнее
          </button>
          <button 
            className="btn primary" 
            onClick={() => onAddToCart && onAddToCart(product)}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
