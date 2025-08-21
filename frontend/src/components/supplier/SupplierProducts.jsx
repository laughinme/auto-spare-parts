import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct, updateProduct } from '../../api/api.js';
import { useDebounce } from '../../hooks/useDebounce'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProductCard from '../product/ProductCard.jsx';

// Компонент модального окна для редактирования товара
function EditProductModal({ product, onSave, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        brand: product.brand || '',
        part_number: product.part_number || '',
        price: product.price || 0,
        condition: product.condition || 'new',
        description: product.description || '',
        status: product.status || 'draft'
    });
    
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.brand.trim()) {
            newErrors.brand = 'Бренд обязателен';
        }
        
        if (!formData.part_number.trim()) {
            newErrors.part_number = 'Номер детали обязателен';
        }
        
        if (formData.price <= 0) {
            newErrors.price = 'Цена должна быть больше 0';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Очищаем ошибку при изменении поля
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
            onClick={(e) => {
                // Закрываем модальное окно при клике на backdrop
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Редактировать товар</h2>
                                <p className="text-sm text-gray-600">Обновите информацию о товаре</p>
                            </div>
                        </div>
                        <button 
                            onClick={onCancel}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Brand and Part Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Бренд <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => handleInputChange('brand', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Например, Bosch"
                                disabled={isLoading}
                            />
                            {errors.brand && <p className="mt-1 text-xs text-red-600">{errors.brand}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Номер детали <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.part_number}
                                onChange={(e) => handleInputChange('part_number', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.part_number ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Например, 0123456789"
                                disabled={isLoading}
                            />
                            {errors.part_number && <p className="mt-1 text-xs text-red-600">{errors.part_number}</p>}
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Цена (₽) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                            disabled={isLoading}
                        />
                        {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                    </div>

                    {/* Condition and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Состояние</label>
                            <select
                                value={formData.condition}
                                onChange={(e) => handleInputChange('condition', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                disabled={isLoading}
                            >
                                <option value="new">✨ Новый</option>
                                <option value="used">🔧 Б/у</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                disabled={isLoading}
                            >
                                <option value="draft">📝 Черновик</option>
                                <option value="active">✅ Активный</option>
                                <option value="inactive">⏸️ Неактивный</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                            placeholder="Подробное описание товара..."
                            disabled={isLoading}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Сохранить изменения
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Компонент модального окна подтверждения удаления
function DeleteConfirmationModal({ deleteConfirmation, onConfirm, onCancel, isLoading }) {
    return (
        <div 
            className="fixed inset-0  bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
            onClick={(e) => {
                // Закрываем модальное окно при клике на backdrop
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 border border-gray-200 max-w-md w-full p-6 transform animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Удалить товар</h3>
                        <p className="text-sm text-gray-600">Это действие необратимо</p>
                    </div>
                </div>
                
                <div className="mb-6">
                    <p className="text-gray-700">
                        Вы уверены, что хотите удалить товар 
                        <span className="font-semibold text-gray-900"> "{deleteConfirmation.productName}"</span>?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Все данные о товаре будут безвозвратно удалены.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Отмена
                    </button>
                    <button 
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Удаление...
                            </>
                        ) : (
                            'Удалить'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SupplierProducts({ orgId, onCreateNavigate, onProductView }) {
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query, 500);
	const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { productId, productName }
	const [editingProduct, setEditingProduct] = useState(null); // product object being edited
	const [successMessage, setSuccessMessage] = useState(''); // success notification

    const queryClient = useQueryClient();


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

    const deleteMutation = useMutation({
        mutationFn: (productId) => deleteProduct({ orgId, productId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', orgId, debouncedQuery] });
            setDeleteConfirmation(null);
        },
        onError: (error) => {
            console.error('Delete product error:', error);
            alert('Ошибка при удалении товара. Попробуйте еще раз.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ productId, productData }) => updateProduct({ orgId, productId, productData }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', orgId, debouncedQuery] });
            setEditingProduct(null);
            setSuccessMessage('Товар успешно обновлен!');
            setTimeout(() => setSuccessMessage(''), 3000);
        },
        onError: (error) => {
            console.error('Update product error:', error);
            alert('Ошибка при обновлении товара. Попробуйте еще раз.');
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


    const handleDelete = (product) => {
        setDeleteConfirmation({
            productId: product.id,
            productName: product.title || product.brand || 'товар'
        });
    };

    const confirmDelete = () => {
        if (deleteConfirmation) {
            deleteMutation.mutate(deleteConfirmation.productId);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    const handleEdit = (product) => {
        setEditingProduct({
            ...product,
            // Инициализируем форму с текущими значениями
            originalData: { ...product }
        });
    };

    const handleUpdateProduct = (formData) => {
        if (editingProduct) {
            updateMutation.mutate({
                productId: editingProduct.id,
                productData: formData
            });
        }
    };

    const cancelEdit = () => {
        setEditingProduct(null);
    };
    console.log('SupplierProducts debug:', {
        orgId,
        debouncedQuery,
        hasData: !!data,
        productsCount: products.length,
        totalProducts
    });

	return (
        <div className="relative space-y-6 min-h-screen">
            {/* Success Notification */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        {successMessage}
                    </div>
                </div>
            )}
            
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
                        <ProductCard
                            key={p.id}
                            product={p}
                            variant="supplier"
                            onView={(product) => {
                                console.log('SupplierProducts: Product clicked:', product);
                                onProductView && onProductView(product);
                            }}
                            onEdit={(product) => handleEdit(product)}
                            onDelete={(product) => handleDelete(product)}
                            isDeleting={deleteMutation.isPending && deleteConfirmation?.productId === p.id}
                            isEditing={editingProduct?.id === p.id}
                        />
                    ))}
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onSave={handleUpdateProduct}
                    onCancel={cancelEdit}
                    isLoading={updateMutation.isPending}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <DeleteConfirmationModal
                    deleteConfirmation={deleteConfirmation}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    isLoading={deleteMutation.isPending}
                />
            )}
        </div>
    );
}