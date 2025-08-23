import React, { useState } from "react";
import { formatPrice } from "../../utils/helpers.js";
import { useQuery } from "@tanstack/react-query";
import { getDetailsProducts } from "../../api/api.js";

/**
 * Компонент звездного рейтинга для ProductDetail
 */
function StarRating({ rating = 0, totalReviews = 0, size = "lg" }) {
  // ... (Ваш код для StarRating остается без изменений)
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  const starSize = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className={`${starSize} text-yellow-400 fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <svg key={i} className={`${starSize} text-yellow-400`} viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`half-detail-${i}`}>
              <stop offset="50%" stopColor="currentColor"/>
              <stop offset="50%" stopColor="rgb(209 213 219)"/>
            </linearGradient>
          </defs>
          <path fill={`url(#half-detail-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className={`${starSize} text-gray-300 fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      );
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">{stars}</div>
      <span className="text-lg font-medium text-gray-700">{rating.toFixed(1)}</span>
      {totalReviews > 0 && (
        <span className="text-gray-500">({totalReviews} отзывов)</span>
      )}
    </div>
  );
}

export default function ProductDetail({ orgId, productId, product: mockProduct, onAdd, onBack, onChat, isSupplierView = false }) {
  const { data: apiProduct, isLoading, isError, error } = useQuery({
    queryKey: ['productDetails', orgId, productId],
    queryFn: () => getDetailsProducts({ orgId, productId }),
    enabled: !!orgId && !!productId,
    retry: false,
  });

  const product = apiProduct || mockProduct;

  const [quantity, setQuantity] = useState(1);
  // ИЗМЕНЕНО: Теперь состояние хранит индекс выбранной картинки и функцию для его изменения.
  const [selectedImage, setSelectedImage] = useState(0); 
  
  if (isLoading) {
    return <div className="p-8 text-center">Загрузка информации о товаре...</div>;
  }
  if (isError && !mockProduct) {
    return <div className="p-8 text-center text-red-500">Ошибка: {error.message}</div>;
  }
  if (!product) {
    return <div className="p-8 text-center">Товар не найден.</div>;
  }

  const productTitle = product.brand || product.title || 'Товар';
  const productPartNumber = product.part_number || '';
  
  // ИЗМЕНЕНО: Создаем полноценный массив со всеми URL изображений из API.
  const images = (product.media && product.media.length > 0)
    ? product.media.map(img => img.url)
    : [product.img || 'https://via.placeholder.com/400'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group transition-colors"
          onClick={() => onBack && onBack()}
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg>
          Назад к каталогу
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            {/* Основное изображение товара */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative group">
                <img 
                  src={images[selectedImage]} // Отображаем выбранное изображение
                  alt={productTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-6 right-6">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${product.condition === 'new' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'}`}>
                    {product.condition === 'new' ? '✨ Новая деталь' : '🔧 Б/у деталь'}
                  </span>
                </div>
              </div>
            </div>

            {/* НОВЫЙ БЛОК: Галерея миниатюр */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)} // При клике меняем индекс активного фото
                    className={`aspect-square rounded-2xl overflow-hidden focus:outline-none transition-all duration-200
                      ${selectedImage === index 
                        ? 'ring-4 ring-blue-500 ring-offset-2' // Стиль для активной миниатюры
                        : 'opacity-60 hover:opacity-100' // Стиль для неактивных
                      }`
                    }
                  >
                    <img 
                      src={image} 
                      alt={`Фото товара ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Остальной код (описание, цена и т.д.) остается без изменений */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2">
                    {productTitle}
                </h1>
                {productPartNumber && (
                    <p className="text-lg text-gray-500 mb-6">
                        Артикул: {productPartNumber}
                    </p>
                )}
                <div className="mb-6">
                    <StarRating rating={4.5} totalReviews={123} />
                    <p className="text-xs text-gray-400 mt-1">Рейтинг является временным</p>
                </div>
                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {productTitle?.charAt(0) || 'T'}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{productTitle}</div>
                        <div className="text-sm text-gray-600">Товар</div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 mb-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)} ₽</span>
                    </div>
                </div>
                {!isSupplierView && (
                   <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Количество</label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                <button className="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 font-medium" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                <input type="number" className="w-20 text-center py-3 border-0 font-medium focus:ring-0" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                                <button className="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 font-medium" onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                            <div className="text-lg font-semibold text-gray-900">Итого: {formatPrice(product.price * quantity)} ₽</div>
                        </div>
                    </div>
                )}
                {!isSupplierView ? (
                    <>
                        <div className="flex gap-4">
                            <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg" onClick={() => onAdd && onAdd(product, quantity)}>🛒 Добавить в корзину</button>
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold" onClick={onChat}>💬</button>
                        </div>
                    </>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                        <div className="text-blue-800 font-semibold mb-2">👨‍💼 Просмотр поставщика</div>
                        <div className="text-sm text-blue-600">Вы просматриваете свой товар.</div>
                    </div>
                )}
            </div>
            {product.description && (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Описание товара</h3>
                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed">{product.description}</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}