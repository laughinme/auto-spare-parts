import React, {useState, useEffect } from "react";
import { createProduct, uploadProductPhotos } from "../../api/api.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PhotoUpload from "../product/PhotoUpload.jsx";
export default function SupplierProductCreate({onCancel, onCreate,orgId  }) {

  const queryClient = useQueryClient();

  const [brand, setBrand] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("new");
  const [description, setDescription] = useState("");
  const [status] = useState("draft");
  const [photos, setPhotos] = useState([]);
  
  const { mutate: createProductMutation, isPending, error } = useMutation({
    mutationFn: createProduct,
    onSuccess: async (createdProduct) => {
      // If photos are selected, upload them after product creation
      if (photos.length > 0) {
        try {
          const filesToUpload = photos.filter(photo => photo.isNew && photo.file);
          if (filesToUpload.length > 0) {
            const files = filesToUpload.map(photo => photo.file);
            await uploadProductPhotos({ 
              orgId, 
              productId: createdProduct.id, 
              files 
            });
          }
        } catch (photoError) {
          console.error('Failed to upload photos:', photoError);
          alert(`Товар создан, но не удалось загрузить фото: ${photoError.message}`);
        }
      }

      alert("Товар успешно создан!");
      // Инвалидируем кэш продуктов для данной организации
      queryClient.invalidateQueries({ 
        queryKey: ['products', orgId] 
      });
      // Переходим на страницу товаров
      if (onCancel) {
        onCancel(); // Это вернет нас на страницу товаров
      }
      onCreate && onCreate(createdProduct);
    },
    onError: (err) => {
      alert(`Не удалось создать товар: ${err.message}`);
      console.error(err);
    },
  });


  const canSubmit = brand.trim() && partNumber.trim() && price.trim() && description.trim();


const handleCreate = () => {
    if (!canSubmit) return;

    const productData = {
      brand: brand.trim(),
      part_number: partNumber.trim(),
      price: parseFloat(price) || 0,
      condition: condition,
      description: description.trim(),
      status: status,
    };
    if (!orgId) {
      alert("Ошибка: ID организации не найден.");
      return;
  }
  createProductMutation({ productData, orgId }); 
};

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.preview && photo.isNew) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [photos]);


  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-bold">Создание нового товара</h1>
                  </div>
                  <p className="text-blue-100 text-sm">Заполните информацию о запчасти для добавления в каталог</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    className="px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium transition-all duration-200 border border-white/30" 
                    onClick={onCancel}
                  >
                    Отмена
                  </button>
                  <button 
                    className={`px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-lg transition-all duration-200 shadow-lg
                      ${canSubmit && !isPending 
                        ? 'hover:bg-blue-50 hover:shadow-xl transform hover:scale-105' 
                        : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!canSubmit || isPending} 
                    onClick={handleCreate}
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Создание...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Создать товар
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-red-100 rounded-full">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-red-800 font-medium">{error.message || "Произошла ошибка"}</span>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        Основная информация
                      </h3>

                      <div className="space-y-4">
                        <div className="group">
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Бренд *</label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <input 
                              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                              placeholder="Например: BMW, Mercedes, Audi" 
                              value={brand} 
                              onChange={(e) => setBrand(e.target.value)} 
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Номер детали *</label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                            </div>
                            <input 
                              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                              placeholder="Оригинальный номер детали" 
                              value={partNumber} 
                              onChange={(e) => setPartNumber(e.target.value)} 
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Цена *</label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <input 
                              className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                              placeholder="0.00" 
                              inputMode="numeric" 
                              value={price} 
                              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} 
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₽</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Details */}
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        Детали товара
                      </h3>

                      <div className="space-y-4">
                        <div className="group">
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Состояние</label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <select 
                              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
                              value={condition} 
                              onChange={(e) => setCondition(e.target.value)}
                            >
                              <option value="new">✨ Новое</option>
                              <option value="used">🔄 Б/У</option>
                              <option value="refurbished">🛠️ Восстановленное</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="group">
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Описание *</label>
                          <div className="relative">
                            <textarea 
                              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none" 
                              placeholder="Подробное описание товара, совместимость, особенности..." 
                              rows={4}
                              value={description} 
                              onChange={(e) => setDescription(e.target.value)}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                              {description.length}/500
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Photo Upload Section */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        Фотографии товара
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Добавьте качественные фотографии товара, чтобы покупатели могли лучше оценить запчасть
                      </p>
                      
                      <PhotoUpload 
                        photos={photos}
                        onPhotosChange={setPhotos}
                        maxFiles={10}
                        disabled={isPending}
                      />
                    </div>

                    {/* Progress Indicator */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Заполнение формы</span>
                        <span className="text-sm text-slate-500">{Math.round((Object.values({brand, partNumber, price, description}).filter(Boolean).length / 4) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300" 
                          style={{width: `${(Object.values({brand, partNumber, price, description}).filter(Boolean).length / 4) * 100}%`}}
                        ></div>
                      </div>
                      {photos.length > 0 && (
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          📸 {photos.length} фото добавлено
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}



