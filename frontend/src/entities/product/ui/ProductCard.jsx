import React from "react";
import { formatPrice } from "../../../shared/lib/helpers.js";

const DEFAULT_PRODUCT_IMAGE =
"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' fill='%23678999' font-size='20' text-anchor='middle' dominant-baseline='middle'%3ENo%20image%3C/text%3E%3C/svg%3E";

function StarRating({ rating = 0, totalReviews = 0, size = "sm" }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  const starSize = size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5";

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className={`${starSize} text-yellow-400 fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <svg key={i} className={`${starSize} text-yellow-400`} viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="rgb(209 213 219)" />
            </linearGradient>
          </defs>
          <path fill={`url(#half-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className={`${starSize} text-gray-300 fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">{stars}</div>
      {totalReviews > 0 &&
      <span className="text-xs text-gray-500 ml-1">({totalReviews})</span>
      }
    </div>);

}

export default function ProductCard({
  product,
  variant = "catalog",
  quantity,
  onView,
  onAddToCart,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  isDeleting = false,
  isEditing = false,
  isPublishing = false,
  isUnpublishing = false,
  onUpdateQuantity,
  onRemove,
  className = ""
}) {

  const getProductImage = () => {
    if (product.img) return product.img;
    if (product.media?.[0]?.url) return product.media[0].url;
    return DEFAULT_PRODUCT_IMAGE;
  };


  const getProductTitle = () => {
    if (product.title) return product.title;
    if (product.brand && product.part_number) return `${product.brand} (${product.part_number})`;
    return product.brand || "Без названия";
  };


  const getProductDescription = () => {
    if (variant === "supplier") {
      return product.description || "Нет описания";
    }
    return null;
  };


  const getSupplierInfo = () => {
    const supplierName = product.supplierName || product.organization?.name;
    if (supplierName) {
      const condition =
      product.condition === "new" || product.condition === "NEW" ?
      "Новая" :
      product.condition === "used" || product.condition === "USED" ?
      "Б/у" :
      null;
      return condition ? `${supplierName} • ${condition}` : supplierName;
    }
    if (product.make?.make_name) return product.make.make_name;
    return null;
  };


  const getShippingInfo = () => {
    if (product.shipEtaDays) {
      return `Доставка ~${product.shipEtaDays} дн.`;
    }
    return null;
  };


  const getDisplayPrice = () => {
    const priceValue = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    if (Number.isFinite(priceValue)) {
      return `${formatPrice(priceValue)} ₽`;
    }
    return 'Цена по запросу';
  };


  if (variant === "cart") {
    return (
      <div className={`p-5 flex items-center gap-4 border-b last:border-0 hover:bg-slate-50 transition-colors ${className}`}>
        <div className="relative">
          <img
            src={getProductImage()}
            alt={getProductTitle()}
            className="w-24 h-20 object-cover rounded-xl shadow-sm" />

          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
            {quantity}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 line-clamp-1 mb-1">{getProductTitle()}</div>
          <div className="text-sm text-gray-600 mb-2">{product.supplierName}</div>
          <StarRating rating={product.rating || 0} totalReviews={product.reviewCount || 0} size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <button
              className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-600"
              onClick={() => onUpdateQuantity && onUpdateQuantity(product.id, Math.max(1, quantity - 1))}>

              −
            </button>
            <input
              type="number"
              className="w-16 text-center border-0 py-1 text-sm font-medium focus:ring-0"
              value={quantity}
              onChange={(e) => onUpdateQuantity && onUpdateQuantity(product.id, parseInt(e.target.value || "1", 10))} />

            <button
              className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-600"
              onClick={() => onUpdateQuantity && onUpdateQuantity(product.id, quantity + 1)}>

              +
            </button>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-gray-900">{formatPrice(product.price * quantity)} ₽</div>
            <div className="text-xs text-gray-500">{formatPrice(product.price)} ₽ за шт.</div>
          </div>
          <button
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            onClick={() => onRemove && onRemove(product.id)}
            title="Удалить из корзины">

            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>);

  }


  if (variant === "supplier") {
    return (
      <div
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group cursor-pointer ${className}`}
        onClick={() => {
          console.log('ProductCard: supplier variant clicked, onView:', !!onView, 'product:', product);
          onView && onView(product);
        }}>

        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={getProductImage()}
            alt={getProductTitle()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            product.condition === 'new' ?
            'bg-green-100 text-green-800 border border-green-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'}`
            }>
              {product.condition === 'new' ? '✨ Новый' : '🔧 Б/У'}
            </span>
            {}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-500 transform ${
            product.status === 'published' ?
            'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-emerald-200/50 shadow-lg' :
            product.status === 'draft' ?
            'bg-gray-100 text-gray-800 border-gray-200' :
            'bg-yellow-100 text-yellow-800 border-yellow-200'} ${
            isPublishing || isUnpublishing ? 'animate-pulse scale-105' : ''}`}>
              {isPublishing ?
              '🔄 Публикуется...' :
              isUnpublishing ?
              '🔄 Скрывается...' :
              product.status === 'published' ?
              '🌐 Опубликован' :
              product.status === 'draft' ?
              '📝 Черновик' :
              '⏸️ Не активен'
              }
            </span>
            {}
            {onDelete &&
            <button
              className={`transition-all duration-300 transform text-white p-2 rounded-full shadow-lg hover:shadow-xl ${
              isDeleting ?
              'opacity-100 translate-y-0 bg-gray-400 cursor-not-allowed' :
              'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 bg-red-500 hover:bg-red-600'}`
              }
              onClick={(e) => {
                e.stopPropagation();
                if (!isDeleting) {
                  onDelete && onDelete(product);
                }
              }}
              disabled={isDeleting}
              title={isDeleting ? "Удаление..." : "Удалить товар"}>

                {isDeleting ?
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg> :

              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
              }
              </button>
            }
          </div>
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
              <StarRating rating={product.rating || 0} totalReviews={product.reviewCount || 0} size="sm" />
            </div>
            
            {}
            {product.status === 'draft' && onPublish &&
            <button
              className="transition-all duration-300 transform text-white p-2 rounded-full shadow-lg hover:shadow-xl bg-emerald-500 hover:bg-emerald-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
              onClick={(e) => {
                e.stopPropagation();
                onPublish && onPublish(product);
              }}
              title="Быстрая публикация">

                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
            }
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">
              {getProductTitle()}
            </h3>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-gray-900">{formatPrice(product.price)} ₽</div>
              <div className="text-xs text-gray-500">за единицу</div>
            </div>
          </div>
          
          {getProductDescription() &&
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
              {getProductDescription()}
            </p>
          }
          
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
            {}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-600 font-medium">В наличии</span>
            </div>
            
            {}
            <div className="grid grid-cols-2 gap-2">
              {}
              <div className="flex flex-col gap-1">
                <button
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isEditing ?
                  'text-gray-400 bg-gray-50 cursor-not-allowed' :
                  'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isEditing) {
                      onEdit && onEdit(product);
                    }
                  }}
                  disabled={isEditing}
                  title={isEditing ? "Редактируется..." : "Редактировать товар"}>

                  {isEditing ?
                  <>
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Редактируется...
                    </> :

                  <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Редактировать
                    </>
                  }
                </button>
                
                {onDelete &&
                <button
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isDeleting ?
                  'text-gray-400 bg-gray-50 cursor-not-allowed' :
                  'text-red-600 hover:text-red-700 hover:bg-red-50'}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDeleting) {
                      onDelete && onDelete(product);
                    }
                  }}
                  disabled={isDeleting}
                  title={isDeleting ? "Удаление..." : "Удалить товар"}>

                    {isDeleting ?
                  <>
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Удаление...
                      </> :

                  <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Удалить
                      </>
                  }
                  </button>
                }
              </div>
              
              {}
              <div className="flex flex-col gap-1">
                {product.status === 'published' ?

                onUnpublish &&
                <button
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isUnpublishing ?
                  'text-gray-400 bg-gray-50 cursor-not-allowed' :
                  'text-orange-600 hover:text-orange-700 hover:bg-orange-50'}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isUnpublishing) {
                      onUnpublish && onUnpublish(product);
                    }
                  }}
                  disabled={isUnpublishing}
                  title={isUnpublishing ? "Снимается с публикации..." : "Снять с публикации"}>

                      {isUnpublishing ?
                  <>
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Снимается...
                        </> :

                  <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                          Скрыть
                        </>
                  }
                    </button> :



                onPublish &&
                <button
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isPublishing ?
                  'text-gray-400 bg-gray-50 cursor-not-allowed' :
                  'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPublishing) {
                      onPublish && onPublish(product);
                    }
                  }}
                  disabled={isPublishing}
                  title={isPublishing ? "Публикуется..." : "Опубликовать в каталоге"}>

                      {isPublishing ?
                  <>
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Публикуется...
                        </> :

                  <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Опубликовать
                        </>
                  }
                    </button>

                }
              </div>
            </div>
          </div>
        </div>
      </div>);

  }


  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer h-full ${className}`}
      onClick={() => onView && onView(product)}>

      <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={getProductImage()}
          alt={getProductTitle()}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

        
        {}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        {}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg ${
          product.condition === 'new' ?
          'bg-gradient-to-r from-green-400 to-green-500 text-white' :
          'bg-gradient-to-r from-blue-400 to-blue-500 text-white'}`
          }>
            {product.condition === 'new' ? '✨ Новая' : '🔧 Б/у'}
          </span>
        </div>
        
        {}
        <div className="absolute top-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-sm">
            <StarRating rating={product.rating || 0} totalReviews={product.reviewCount || 0} size="sm" />
          </div>
        </div>
        
        {}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <button
              className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-white transition-colors shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onView && onView(product);
              }}>

              👁️ Подробнее
            </button>
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart && onAddToCart(product);
              }}>

              🛒 В корзину
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col h-full">
        {}
        {product.vehicle &&
        <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium mb-3">
            🚗 {product.vehicle}
          </div>
        }
        
        {}
        <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
          {getProductTitle()}
        </h3>
        
        {}
        <div className="flex items-center justify-between mb-3">
          <StarRating rating={product.rating || 0} totalReviews={product.reviewCount || 0} size="md" />
          {getShippingInfo() &&
          <div className="flex items-center gap-1 text-xs text-gray-500">
              🚚 {getShippingInfo()}
            </div>
          }
        </div>
        
        {}
        {getSupplierInfo() &&
        <div className="text-sm text-gray-600 mb-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            {getSupplierInfo()}
          </div>
        }
        
        {}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-2xl font-bold text-gray-900">{formatPrice(product.price)} ₽</div>
            <div className="text-xs text-gray-500">включая НДС</div>
          </div>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart && onAddToCart(product);
            }}>

            В корзину
          </button>
        </div>
      </div>
    </div>);

}