import React from "react";

export default function SupplierDashboard({ supplierProfile, metrics, onNavigate }) {
  const { gmv, pending, mySkus, orders, conv } = metrics || {};

  return (
    <div className="space-y-6">
      {}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Дашборд поставщика</h1>
          <p className="text-slate-600 mt-1">
            Добро пожаловать, {supplierProfile?.companyName || "Партнер"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Последнее обновление</p>
          <p className="text-sm font-medium">{new Date().toLocaleDateString("ru-RU")}</p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Общий оборот</p>
              <p className="text-2xl font-bold text-slate-900">
                {gmv?.toLocaleString("ru-RU") || "0"} ₽
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+12.5% к прошлому месяцу</span>
          </div>
        </div>

        {}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Новые заказы</p>
              <p className="text-2xl font-bold text-slate-900">{pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-orange-600">Требуют обработки</span>
          </div>
        </div>

        {}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Товары в каталоге</p>
              <p className="text-2xl font-bold text-slate-900">{mySkus || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-blue-600">Активных позиций</span>
          </div>
        </div>

        {}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Конверсия</p>
              <p className="text-2xl font-bold text-slate-900">{conv || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-purple-600">Просмотры → Заказы</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Последние заказы</h3>
            <span className="text-sm text-slate-500">{orders || 0} всего</span>
          </div>
          
          {orders > 0 ?
          <div className="space-y-3">
              {}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Заказ #12345</p>
                  <p className="text-sm text-slate-600">Тормозные колодки BMW</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">15,000 ₽</p>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                    Новый
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Заказ #12344</p>
                  <p className="text-sm text-slate-600">Фильтр масляный</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">2,500 ₽</p>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Выполнен
                  </span>
                </div>
              </div>
            </div> :

          <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Заказов пока нет</p>
            </div>
          }
        </div>

        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Быстрые действия</h3>
          
          <div className="space-y-3">
            <button
              className="w-full btn primary justify-start"
              onClick={() => onNavigate && onNavigate("supplier:products:new")}>

              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить новый товар
            </button>
            
            <button
              className="w-full btn secondary justify-start"
              onClick={() => onNavigate && onNavigate("order")}>

              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Управление заказами
            </button>
            
            <button
              className="w-full btn secondary justify-start"
              onClick={() => onNavigate && onNavigate("supplier:products")}>

              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Каталог товаров
            </button>
            
            <button
              className="w-full btn secondary justify-start"
              onClick={() => onNavigate && onNavigate("analytics")}>

              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
              </svg>
              Аналитика и отчеты
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Рекомендации</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-blue-900">Оптимизируйте каталог</p>
              <p className="text-sm text-blue-700 mt-1">
                Добавьте больше фотографий и описаний к товарам для увеличения конверсии
              </p>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-900">Отличная работа!</p>
              <p className="text-sm text-green-700 mt-1">
                Ваша конверсия выше среднего по рынку. Продолжайте в том же духе!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);

}