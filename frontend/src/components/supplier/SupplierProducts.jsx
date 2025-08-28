import React, { useEffect, useState } from "react";
import {
  getProducts,
  deleteProduct,
  updateProduct,
  publishProduct,
  unpublishProduct,
  getVehicleMakes,
} from "../../api/api.js";
import { useDebounce } from "../../hooks/useDebounce";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductCard from "../product/ProductCard.jsx";

/* ===== Edit Modal (под новую схему, без ?. и ??) ===== */
function EditProductModal({ product, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: product && product.title ? product.title : "",
    make_id:
      product && product.make && typeof product.make.make_id !== "undefined"
        ? product.make.make_id
        : "",
    part_number:
      product && product.part_number ? product.part_number : "",
    price:
      product && typeof product.price === "number" ? product.price : 0,
    stock_type:
      product && product.stock_type ? product.stock_type : "unique",
    quantity:
      product && typeof product.quantity_on_hand === "number"
        ? product.quantity_on_hand
        : 1,
    condition:
      product && product.condition ? product.condition : "new",
    originality:
      product && product.originality ? product.originality : "oem",
    allow_cart: !!(product && product.allow_cart),
    description:
      product && product.description ? product.description : "",
    status: product && product.status ? product.status : "draft",
  });

  const [errors, setErrors] = useState({});
  const [makes, setMakes] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingMakes(true);
        const data = await getVehicleMakes({ limit: 100 });
        if (alive) setMakes(Array.isArray(data) ? data : []);
      } finally {
        if (alive) setLoadingMakes(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (formData.stock_type === "unique") {
      setFormData((prev) => ({ ...prev, allow_cart: false }));
    }
  }, [formData.stock_type]);

  const validateForm = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Название обязательно";
    if (!formData.make_id) e.make_id = "Марка обязательна";
    if (!formData.part_number.trim())
      e.part_number = "Номер детали обязателен";
    if (!formData.stock_type) e.stock_type = "Выберите тип склада";
    if (!formData.quantity || formData.quantity <= 0)
      e.quantity = "Укажите количество";
    if (formData.price <= 0) e.price = "Цена должна быть больше 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    onSave({
      title: formData.title.trim(),
      make_id: parseInt(formData.make_id, 10),
      part_number: formData.part_number.trim(),
      price: Number(formData.price),
      stock_type: formData.stock_type,
      quantity: Number(formData.quantity),
      condition: formData.condition,
      originality: formData.originality,
      allow_cart:
        formData.stock_type === "unique" ? false : !!formData.allow_cart,
      status: formData.status,
      description: formData.description || null,
    });
  };

  const set = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  return (
    <div
      className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Редактировать товар</h2>
            <button onClick={onCancel} disabled={isLoading}>✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Название *</label>
              <input
                value={formData.title}
                onChange={(e) => set("title", e.target.value)}
                className={`input ${errors.title ? "border-red-300" : ""}`}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2">Марка *</label>
              <select
                value={formData.make_id}
                onChange={(e) => set("make_id", e.target.value)}
                className={`input ${errors.make_id ? "border-red-300" : ""}`}
                disabled={isLoading}
              >
                <option value="">
                  {loadingMakes ? "Загрузка..." : "Выберите марку"}
                </option>
                {makes.map((m) => (
                  <option key={m.make_id} value={m.make_id}>
                    {m.make_name}
                  </option>
                ))}
              </select>
              {errors.make_id && (
                <p className="text-xs text-red-600 mt-1">{errors.make_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Номер детали *</label>
              <input
                value={formData.part_number}
                onChange={(e) => set("part_number", e.target.value)}
                className={`input ${errors.part_number ? "border-red-300" : ""}`}
                disabled={isLoading}
              />
              {errors.part_number && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.part_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2">Цена (₽) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                className={`input ${errors.price ? "border-red-300" : ""}`}
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-xs text-red-600 mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2">Тип склада *</label>
              <select
                value={formData.stock_type}
                onChange={(e) => set("stock_type", e.target.value)}
                className={`input ${errors.stock_type ? "border-red-300" : ""}`}
                disabled={isLoading}
              >
                <option value="unique">Единичный товар</option>
                <option value="stock">Склад</option>
              </select>
              {errors.stock_type && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.stock_type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2">Количество *</label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => set("quantity", parseInt(e.target.value, 10) || 1)}
                className={`input ${errors.quantity ? "border-red-300" : ""}`}
                disabled={isLoading}
              />
              {errors.quantity && (
                <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2">Оригинальность *</label>
              <select
                value={formData.originality}
                onChange={(e) => set("originality", e.target.value)}
                className="input"
                disabled={isLoading}
              >
                <option value="oem">OEM</option>
                <option value="aftermarket">Aftermarket</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Состояние</label>
              <select
                value={formData.condition}
                onChange={(e) => set("condition", e.target.value)}
                className="input"
                disabled={isLoading}
              >
                <option value="new">✨ Новый</option>
                <option value="used">🔧 Б/у</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Статус</label>
              <select
                value={formData.status}
                onChange={(e) => set("status", e.target.value)}
                className="input"
                disabled={isLoading}
              >
                <option value="draft">📝 Черновик</option>
                <option value="published">✅ Опубликован</option>
                <option value="archived">⏸️ Архивирован</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="allowCartEdit"
              type="checkbox"
              className="w-4 h-4"
              checked={
                formData.stock_type === "unique" ? false : !!formData.allow_cart
              }
              onChange={(e) => set("allow_cart", e.target.checked)}
              disabled={formData.stock_type === "unique" || isLoading}
            />
            <label htmlFor="allowCartEdit" className="text-sm">
              Разрешить добавление в корзину (только для склада)
            </label>
          </div>

          <div>
            <label className="block text-sm mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="btn secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn primary flex-1"
            >
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== Publish/Unpublish Confirmation ===== */
function PublishConfirmationModal({ confirmationData, onConfirm, onCancel, isLoading }) {
  const isPublish = confirmationData && confirmationData.action === "publish";
  const actionText = isPublish ? "Опубликовать" : "Снять с публикации";
  return (
    <div
      className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">{actionText} товар</h3>
        <p className="mb-6">
          Подтвердите действие для “{confirmationData && confirmationData.productName}”.
        </p>
        <div className="flex gap-3">
          <button className="btn secondary flex-1" onClick={onCancel} disabled={isLoading}>Отмена</button>
          <button className={`btn ${isPublish ? "primary" : "warning"} flex-1`} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Выполняется..." : actionText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Delete Confirmation ===== */
function DeleteConfirmationModal({ deleteConfirmation, onConfirm, onCancel, isLoading }) {
  return (
    <div
      className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">Удалить товар</h3>
        <p className="mb-6">
          Вы уверены, что хотите удалить “{deleteConfirmation.productName}”?
        </p>
        <div className="flex gap-3">
          <button className="btn secondary flex-1" onClick={onCancel} disabled={isLoading}>Отмена</button>
          <button className="btn danger flex-1" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Основной компонент — ОБЯЗАТЕЛЬНО default export ===== */
export default function SupplierProducts({ orgId, onCreateNavigate, onProductView }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [publishConfirmation, setPublishConfirmation] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [publishingProducts, setPublishingProducts] = useState(new Set());
  const [unpublishingProducts, setUnpublishingProducts] = useState(new Set());

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", orgId, debouncedQuery],
    queryFn: () => getProducts({ orgId, query: debouncedQuery }),
    enabled: !!orgId,
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) => deleteProduct({ orgId, productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", orgId, debouncedQuery] });
      setDeleteConfirmation(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, productData }) =>
      updateProduct({ orgId, productId, productData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", orgId, debouncedQuery] });
      setEditingProduct(null);
      setSuccessMessage("Товар успешно обновлен!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ productId }) => publishProduct({ orgId, productId }),
    onMutate: ({ productId }) => {
      setPublishingProducts((prev) => new Set([...prev, productId]));
    },
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["products", orgId, debouncedQuery] });
      setPublishingProducts((prev) => {
        const s = new Set(prev); s.delete(productId); return s;
      });
      setSuccessMessage("Товар успешно опубликован в каталоге!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (_err, { productId }) => {
      setPublishingProducts((prev) => {
        const s = new Set(prev); s.delete(productId); return s;
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: ({ productId }) => unpublishProduct({ orgId, productId }),
    onMutate: ({ productId }) => {
      setUnpublishingProducts((prev) => new Set([...prev, productId]));
    },
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["products", orgId, debouncedQuery] });
      setUnpublishingProducts((prev) => {
        const s = new Set(prev); s.delete(productId); return s;
      });
      setSuccessMessage("Товар снят с публикации!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (_err, { productId }) => {
      setUnpublishingProducts((prev) => {
        const s = new Set(prev); s.delete(productId); return s;
      });
    },
  });

  if (isLoading) return <div>Загрузка товаров...</div>;
  if (isError) return <div>Ошибка при загрузке: {error.message}</div>;

  const products = (data && data.items) || [];
  const totalProducts = (data && data.total) || 0;

  const handleDelete = (product) => {
    setDeleteConfirmation({
      productId: product.id,
      productName: product.title || (product.make && product.make.make_name) || "товар",
    });
  };
  const confirmDelete = () => deleteConfirmation && deleteMutation.mutate(deleteConfirmation.productId);
  const cancelDelete = () => setDeleteConfirmation(null);

  const handleEdit = (product) => setEditingProduct({ ...product, originalData: { ...product } });
  const handleUpdateProduct = (payload) => {
    if (editingProduct) {
      updateMutation.mutate({ productId: editingProduct.id, productData: payload });
    }
  };
  const cancelEdit = () => setEditingProduct(null);

  const handlePublish = (product) =>
    setPublishConfirmation({ productId: product.id, productName: product.title, action: "publish" });
  const handleUnpublish = (product) =>
    setPublishConfirmation({ productId: product.id, productName: product.title, action: "unpublish" });
  const confirmPublishAction = () => {
    if (!publishConfirmation) return;
    if (publishConfirmation.action === "publish") {
      publishMutation.mutate({ productId: publishConfirmation.productId });
    } else {
      unpublishMutation.mutate({ productId: publishConfirmation.productId });
    }
    setPublishConfirmation(null);
  };
  const cancelPublishAction = () => setPublishConfirmation(null);

  return (
    <div className="relative space-y-6 min-h-screen">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">{successMessage}</div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Товары</h1>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm text-slate-500">Всего: {totalProducts}</div>
          <button className="btn primary" onClick={() => onCreateNavigate && onCreateNavigate()}>
            Добавить товар
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            className="input w-full"
            placeholder="Поиск по названию, авто, категории"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn secondary" onClick={() => setQuery("")}>Сброс</button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-lg font-semibold mb-1">{debouncedQuery ? "Ничего не найдено" : "Пока нет товаров"}</div>
          <div className="text-sm text-slate-600 mb-4">
            {debouncedQuery ? "Попробуйте другой запрос" : "Нажмите «Добавить товар», чтобы создать первый"}
          </div>
          <button className="btn primary" onClick={() => onCreateNavigate && onCreateNavigate()}>
            Добавить товар
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              variant="supplier"
              onView={(product) => onProductView && onProductView(product)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              isDeleting={deleteMutation.isPending && deleteConfirmation && deleteConfirmation.productId === p.id}
              isEditing={editingProduct && editingProduct.id === p.id}
              isPublishing={publishingProducts.has(p.id)}
              isUnpublishing={unpublishingProducts.has(p.id)}
            />
          ))}
        </div>
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onSave={handleUpdateProduct}
          onCancel={cancelEdit}
          isLoading={updateMutation.isPending}
        />
      )}

      {deleteConfirmation && (
        <DeleteConfirmationModal
          deleteConfirmation={deleteConfirmation}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={deleteMutation.isPending}
        />
      )}

      {publishConfirmation && (
        <PublishConfirmationModal
          confirmationData={publishConfirmation}
          onConfirm={confirmPublishAction}
          onCancel={cancelPublishAction}
          isLoading={publishMutation.isPending || unpublishMutation.isPending}
        />
      )}
    </div>
  );
}
