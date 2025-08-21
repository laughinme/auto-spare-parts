import React, { useState } from "react";
import { formatPrice } from "../../utils/helpers.js";

/**
 * Компонент звездного рейтинга для ProductDetail
 */
function StarRating({ rating = 0, totalReviews = 0, size = "lg" }) {
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

export default function ProductDetail({ product, onAdd, onBack, onChat, isSupplierView = false }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Мокаем несколько изображений для демонстрации галереи
  const images = [
    product.img,
    product.img, // В реальности здесь будут разные изображения
    product.img,
    product.img
  ];

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
			<div className="max-w-7xl mx-auto px-4">
				{/* Кнопка назад */}
				<button 
					className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group transition-colors"
					onClick={onBack}
				>
					<svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
					</svg>
					Назад к каталогу
				</button>

				<div className="grid lg:grid-cols-2 gap-12">
					{/* Левая часть - галерея изображений */}
					<div className="space-y-4">
						{/* Основное изображение */}
						<div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
							<div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative group">
								<img 
									src={images[selectedImage]} 
									alt={product.title}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
								/>
								
								{/* Значок состояния */}
								<div className="absolute top-6 right-6">
									<span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
										product.condition === 'new' 
											? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
											: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
									}`}>
										{product.condition === 'new' ? '✨ Новая деталь' : '🔧 Б/у деталь'}
									</span>
								</div>

								{/* Индикатор доставки */}
								<div className="absolute bottom-6 left-6">
									<div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
										<div className="flex items-center gap-2 text-sm font-medium text-gray-700">
											🚚 Доставка ~{product.shipEtaDays} дней
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Миниатюры */}
						<div className="grid grid-cols-4 gap-3">
							{images.map((img, index) => (
								<button
									key={index}
									className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
										selectedImage === index 
											? 'border-blue-500 shadow-lg scale-105' 
											: 'border-gray-200 hover:border-gray-300'
									}`}
									onClick={() => setSelectedImage(index)}
								>
									<img src={img} alt={`Вид ${index + 1}`} className="w-full h-full object-cover" />
								</button>
							))}
						</div>
					</div>

					{/* Правая часть - информация о товаре */}
					<div className="space-y-8">
						{/* Основная информация */}
						<div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
							{/* Информация об автомобиле */}
							{product.vehicle && (
								<div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 px-4 py-2 rounded-xl text-sm font-medium mb-4">
									🚗 {product.vehicle}
								</div>
							)}

							{/* Название */}
							<h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
								{product.title}
							</h1>

							{/* Рейтинг */}
							<div className="mb-6">
								<StarRating rating={product.rating || 0} totalReviews={product.reviewCount || 0} />
							</div>

							{/* Поставщик */}
							<div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
								<div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
									{product.supplierName?.charAt(0) || 'S'}
								</div>
								<div>
									<div className="font-semibold text-gray-900">{product.supplierName}</div>
									<div className="text-sm text-gray-600">Проверенный поставщик</div>
								</div>
								<div className="ml-auto flex items-center gap-1">
									<div className="w-2 h-2 bg-green-400 rounded-full"></div>
									<span className="text-xs text-gray-600 font-medium">Онлайн</span>
								</div>
							</div>

							{/* Цена */}
							<div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 mb-6">
								<div className="flex items-baseline gap-3">
									<span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)} ₽</span>
									<span className="text-lg text-gray-600">включая НДС</span>
								</div>
								<div className="text-sm text-gray-600 mt-1">
									Цена за единицу • Доступна рассрочка
								</div>
							</div>

							{/* Количество - только для покупателей */}
							{!isSupplierView && (
								<div className="mb-8">
									<label className="block text-sm font-medium text-gray-700 mb-3">Количество</label>
									<div className="flex items-center gap-4">
										<div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
											<button 
												className="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 font-medium"
												onClick={() => setQuantity(Math.max(1, quantity - 1))}
											>
												−
											</button>
											<input 
												type="number" 
												className="w-20 text-center py-3 border-0 font-medium focus:ring-0" 
												value={quantity} 
												onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
											/>
											<button 
												className="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 font-medium"
												onClick={() => setQuantity(quantity + 1)}
											>
												+
											</button>
										</div>
										<div className="text-lg font-semibold text-gray-900">
											Итого: {formatPrice(product.price * quantity)} ₽
										</div>
									</div>
								</div>
							)}

							{/* Кнопки действий */}
							{!isSupplierView ? (
								<>
									<div className="flex gap-4">
										<button 
											className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
											onClick={() => onAdd && onAdd(product, quantity)}
										>
											🛒 Добавить в корзину
										</button>
										<button 
											className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold transition-colors"
											onClick={onChat}
										>
											💬
										</button>
									</div>

									<button 
										className="w-full mt-3 bg-green-50 hover:bg-green-100 text-green-700 px-8 py-3 rounded-xl font-medium transition-colors border border-green-200"
										onClick={onChat}
									>
										📞 Связаться с продавцом
									</button>
								</>
							) : (
								<div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
									<div className="text-blue-800 font-semibold mb-2">👨‍💼 Просмотр поставщика</div>
									<div className="text-sm text-blue-600">
										Вы просматриваете свой товар. Для редактирования вернитесь к списку товаров.
									</div>
								</div>
							)}
						</div>

						{/* Дополнительная информация */}
						<div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
							<h3 className="text-2xl font-bold text-gray-900 mb-6">Описание товара</h3>
							
							{/* Характеристики */}
							<div className="grid grid-cols-2 gap-4 mb-6">
								<div className="bg-gray-50 rounded-xl p-4">
									<div className="text-sm text-gray-600 mb-1">Состояние</div>
									<div className="font-semibold text-gray-900">
										{product.condition === "new" ? "Новая деталь" : "Б/у деталь"}
									</div>
								</div>
								<div className="bg-gray-50 rounded-xl p-4">
									<div className="text-sm text-gray-600 mb-1">Гарантия</div>
									<div className="font-semibold text-gray-900">
										{product.condition === "new" ? "12 месяцев" : "3 месяца"}
									</div>
								</div>
								<div className="bg-gray-50 rounded-xl p-4">
									<div className="text-sm text-gray-600 mb-1">Совместимость</div>
									<div className="font-semibold text-gray-900">Проверить по VIN</div>
								</div>
								<div className="bg-gray-50 rounded-xl p-4">
									<div className="text-sm text-gray-600 mb-1">Наличие</div>
									<div className="font-semibold text-green-600 flex items-center gap-2">
										<div className="w-2 h-2 bg-green-400 rounded-full"></div>
										В наличии
									</div>
								</div>
							</div>

							<div className="prose prose-gray max-w-none">
								<p className="text-gray-700 leading-relaxed">
									Высококачественная деталь {product.condition === "new" ? "прямо от производителя" : "в отличном состоянии"}. 
									Совместимость гарантирована для указанной модели автомобиля. 
									При оформлении заказа вы можете уточнить VIN-номер для 100% совместимости. 
									Быстрая доставка по всей России.
								</p>
							</div>

							{/* Преимущества */}
							<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center gap-3 text-sm text-gray-700">
									<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
										✅
									</div>
									Оригинальная деталь
								</div>
								<div className="flex items-center gap-3 text-sm text-gray-700">
									<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
										🚚
									</div>
									Быстрая доставка
								</div>
								<div className="flex items-center gap-3 text-sm text-gray-700">
									<div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
										🛡️
									</div>
									Гарантия качества
								</div>
								<div className="flex items-center gap-3 text-sm text-gray-700">
									<div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
										💰
									</div>
									Выгодная цена
								</div>
							</div>
			</div>
				</div>
				</div>
			</div>
		</div>
	);
}


