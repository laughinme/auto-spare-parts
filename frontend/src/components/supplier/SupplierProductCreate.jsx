import React, { useState, useEffect } from "react";
import { createProduct, uploadProductPhotos, getVehicleMakes } from "../../api/api.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PhotoUpload from "../product/PhotoUpload.jsx";

export default function SupplierProductCreate({ onCancel, onCreate, orgId }) {
  const queryClient = useQueryClient();

  // Поля под новую схему API (см. openapi ProductCreate)
  const [title, setTitle] = useState("");
  const [makeId, setMakeId] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [price, setPrice] = useState("");
  const [stockType, setStockType] = useState("unique"); // unique | stock
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState("new");    // new | used
  const [originality, setOriginality] = useState("oem"); // oem | aftermarket
  const [allowCart, setAllowCart] = useState(false);    // для unique — всегда false
  const [description, setDescription] = useState("");
  const [status] = useState("draft");                   // draft | published | archived

  // Справочник марок
  const [makes, setMakes] = useState([]);
  const [makesLoading, setMakesLoading] = useState(false);

  // Фото из PhotoUpload
  const [photos, setPhotos] = useState([]);

  // Подгрузка марок
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMakesLoading(true);
        const data = await getVehicleMakes({ limit: 100 });
        if (alive) setMakes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load makes", e);
      } finally {
        if (alive) setMakesLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Если тип склада unique — корзина запрещена
  useEffect(() => {
    if (stockType === "unique") setAllowCart(false);
  }, [stockType]);

  // Утилита: вытянуть человекочитаемое сообщение из FastAPI/Pydantic
  const extractDetail = (err) => {
    const d = err?.response?.data;
    if (!d) return "";
    if (typeof d === "string") return d;
    if (Array.isArray(d?.detail)) {
      return d.detail
        .map((x) => x?.msg || x?.message || JSON.stringify(x))
        .join("; ");
    }
    if (typeof d?.detail === "string") return d.detail;
    if (d?.message) return d.message;
    try { return JSON.stringify(d); } catch { return String(d); }
  };

  const { mutate: createProductMutation, isPending, error } = useMutation({
    mutationFn: createProduct,
    onSuccess: async (createdProduct) => {
      // После успешного создания — заливаем фото (если есть)
      try {
        const filesToUpload = (photos || [])
          .filter((p) => p && p.isNew && p.file)
          .map((p) => p.file);

        if (filesToUpload.length > 0) {
          await uploadProductPhotos({
            orgId,
            productId: createdProduct.id,
            files: filesToUpload,
          });
        }

        alert("Товар успешно создан!");
      } catch (err) {
        const status = err?.response?.status;
        const serverMsg = extractDetail(err);

        console.error("Upload error", {
          status,
          headers: err?.response?.headers,
          data: err?.response?.data,
          files: (photos || [])
            .filter((p) => p?.isNew && p.file)
            .map((p) => ({ name: p.file?.name, type: p.file?.type, size: p.file?.size })),
        });

        if (err.code === "CLIENT_VALIDATION") {
          alert(`Фото отклонены на клиенте: ${err.message}`);
        } else if (status === 422) {
          alert(`Товар создан, но фото не загрузились (422). ${serverMsg || "Проверьте тип (JPEG/PNG) и размер (≤10 MB)."}`);
        } else {
          alert(`Товар создан, но не удалось загрузить фото${status ? ` (${status})` : ""}. ${serverMsg}`);
        }
      }

      // Обновляем список и закрываем форму
      queryClient.invalidateQueries({ queryKey: ["products", orgId] });
      onCancel && onCancel();
      onCreate && onCreate(createdProduct);
    },
    onError: (err) => {
      alert(`Не удалось создать товар: ${err?.message || ""}`);
      console.error(err);
    },
  });

  // Требуемые поля
  const requiredOk = Boolean(
    title.trim() &&
      makeId &&
      partNumber.trim() &&
      price.trim() &&
      quantity.trim() &&
      originality &&
      stockType
  );

  const handleCreate = () => {
    if (!requiredOk) return;
    if (!orgId) {
      alert("Ошибка: ID организации не найден.");
      return;
    }

    const productData = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      make_id: parseInt(makeId, 10),
      part_number: partNumber.trim(),
      price: parseFloat(price) || 0,
      stock_type: stockType,                 // "unique" | "stock"
      quantity: parseInt(quantity, 10) || 0, // при создании обязателен
      condition: condition,                  // "new" | "used"
      originality: originality,              // "oem" | "aftermarket"
      status: status,                        // "draft" (по умолчанию)
      allow_cart: stockType === "unique" ? false : Boolean(allowCart),
      allow_chat: true,
    };

    createProductMutation({ productData, orgId });
  };

  // Очистка blob-url
  useEffect(() => {
    return () => {
      (photos || []).forEach((photo) => {
        if (photo?.preview && photo.isNew) {
          try { URL.revokeObjectURL(photo.preview); } catch {}
        }
      });
    };
  }, [photos]);

  const progressDen = 6; // title, makeId, partNumber, price, quantity, originality
  const progressNum = [title, makeId, partNumber, price, quantity, originality].filter(Boolean).length;
  const progressPct = Math.round((progressNum / progressDen) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          {/* Header */}
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
                    ${requiredOk && !isPending ? "hover:bg-blue-50 hover:shadow-xl transform hover:scale-105" : "opacity-50 cursor-not-allowed"}`}
                  disabled={!requiredOk || isPending}
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

          {/* Ошибка создания */}
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

          {/* Контент формы */}
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Левая колонка */}
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
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Название *</label>
                        <input
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="Например: Фара левая"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Марка (make) *</label>
                        <select
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          value={makeId}
                          onChange={(e) => setMakeId(e.target.value)}
                        >
                          <option value="">{makesLoading ? "Загрузка..." : "Выберите марку"}</option>
                          {makes.map((m) => (
                            <option key={m.make_id} value={m.make_id}>{m.make_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="group">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Номер детали *</label>
                        <input
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="Оригинальный номер детали"
                          value={partNumber}
                          onChange={(e) => setPartNumber(e.target.value)}
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Цена *</label>
                        <div className="relative">
                          <input
                            className="w-full pr-12 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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

                {/* Правая колонка */}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Состояние</label>
                          <select
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                          >
                            <option value="new">✨ Новое</option>
                            <option value="used">🔄 Б/У</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Оригинальность *</label>
                          <select
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                            value={originality}
                            onChange={(e) => setOriginality(e.target.value)}
                          >
                            <option value="oem">OEM</option>
                            <option value="aftermarket">Aftermarket</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Тип склада *</label>
                          <select
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                            value={stockType}
                            onChange={(e) => setStockType(e.target.value)}
                          >
                            <option value="unique">Единичный товар</option>
                            <option value="stock">Склад (много единиц)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Количество *</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ""))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          id="allowCart"
                          type="checkbox"
                          className="w-4 h-4"
                          checked={stockType === "unique" ? false : allowCart}
                          onChange={(e) => setAllowCart(e.target.checked)}
                          disabled={stockType === "unique"}
                        />
                        <label htmlFor="allowCart" className="text-sm text-slate-700">
                          Разрешить добавление в корзину
                          {stockType === "unique" && (
                            <span className="text-slate-500"> — недоступно для единичного товара</span>
                          )}
                        </label>
                      </div>

                      <div className="group">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Описание</label>
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

                  {/* Фото */}
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
                      Добавьте качественные фотографии (JPEG/PNG, до 10 MB)
                    </p>

                    <PhotoUpload
                      photos={photos}
                      onPhotosChange={setPhotos}
                      maxFiles={10}
                      disabled={isPending}
                    />
                  </div>

                  {/* Прогресс */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Заполнение формы</span>
                      <span className="text-sm text-slate-500">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
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
