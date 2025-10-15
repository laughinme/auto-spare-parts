import React, { useState, useEffect } from 'react';

const LandingPage = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);



  const benefits = [
  {
    icon: '💰',
    title: 'Выгодные цены',
    description: 'Цены на запчасти в Дубае на 30-50% ниже российских',
    gradient: 'from-green-400 to-emerald-600'
  },
  {
    icon: '🚀',
    title: 'Огромный ассортимент',
    description: 'Оригинальные и неоригинальные запчасти для любых марок',
    gradient: 'from-blue-400 to-indigo-600'
  },
  {
    icon: '🎯',
    title: 'Прямой доступ',
    description: 'Связь с поставщиками из ОАЭ на одной платформе',
    gradient: 'from-purple-400 to-violet-600'
  },
  {
    icon: '📋',
    title: 'Прозрачность',
    description: 'Понятная система поиска, заказа и отслеживания',
    gradient: 'from-orange-400 to-red-600'
  }];


  const howItWorks = [
  {
    step: '01',
    title: 'Найдите запчасть',
    description: 'Используйте наш умный поиск по марке, модели или VIN-номеру',
    icon: '🔍'
  },
  {
    step: '02',
    title: 'Выберите поставщика',
    description: 'Сравните цены и условия от проверенных поставщиков ОАЭ',
    icon: '🏪'
  },
  {
    step: '03',
    title: 'Оформите заказ',
    description: 'Безопасная оплата и автоматическое оформление документов',
    icon: '💳'
  },
  {
    step: '04',
    title: 'Получите доставку',
    description: 'Отслеживайте заказ до получения на вашем складе',
    icon: '📦'
  }];


  const testimonials = [
  {
    name: 'Алексей Петров',
    role: 'Владелец автосервиса',
    comment: 'Снизили расходы на запчасти на 40% благодаря прямым поставкам из Дубая',
    avatar: '👨‍🔧'
  },
  {
    name: 'Мария Иванова',
    role: 'Менеджер автомагазина',
    comment: 'Отличное качество оригинальных запчастей и быстрая доставка',
    avatar: '👩‍💼'
  },
  {
    name: 'Сергей Коновалов',
    role: 'Автолюбитель',
    comment: 'Нашел редкие запчасти для своего BMW, которых не было в России',
    avatar: '🚗'
  }];


  const faqItems = [
  {
    question: 'Как долго доставка из Дубая?',
    answer: 'Стандартная доставка занимает 7-14 дней. Экспресс-доставка 3-5 дней.'
  },
  {
    question: 'Какие гарантии на запчасти?',
    answer: 'Все оригинальные запчасти имеют международную гарантию. Неоригинальные - гарантия поставщика.'
  },
  {
    question: 'Можно ли вернуть товар?',
    answer: 'Да, возврат возможен в течение 14 дней при соблюдении условий возврата.'
  },
  {
    question: 'Какие способы оплаты доступны?',
    answer: 'Банковские карты, банковские переводы, аккредитивы для крупных заказов.'
  }];


  return (
    <div className="min-h-screen bg-white">
      {}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/90 to-indigo-900/90"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {}
        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            
            {}
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-text-glow">
                  Автозапчасти
                </span>
                <br />
                <span className="text-white">из Дубая</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-2xl">
                Прямые поставки оригинальных и контрактных запчастей из ОАЭ 
                по ценам на <span className="text-green-400 font-bold animate-pulse">30-50% ниже</span> российских
              </p>

              <div className="mb-8">
                <button
                  onClick={onGetStarted}
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 animate-pulse-glow">

                  <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl blur opacity-0 group-hover:opacity-70 transition-opacity duration-300"></span>
                  <span className="relative flex items-center space-x-3">
                    <span>🚀 Начать поиск</span>
                  </span>
                </button>
              </div>

              {}
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Быстрая доставка 7-14 дней</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Гарантия качества на все запчасти</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Поддержка 24/7 на русском языке</span>
                </div>
              </div>
            </div>

            {}
            <div className="relative flex items-center justify-center min-h-[600px]">
              {}
              <div className="relative scale-150 transform">
                
                {}
                <div className="relative z-10">
                  <div className="w-40 h-40 backdrop-blur-xl bg-gradient-to-br from-white/30 to-white/10 rounded-3xl border border-white/40 shadow-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-all duration-1000 animate-pulse-glow">
                    <div className="text-5xl">PROD</div>
                  </div>
                </div>

                {}
                <div className="absolute inset-0">
                  {}
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-blue-400/70 to-cyan-500/70 rounded-full backdrop-blur-lg border border-white/30 flex items-center justify-center animate-float shadow-xl">
                    <span className="text-white text-2xl">🔧</span>
                  </div>
                  
                  {}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-purple-400/70 to-pink-500/70 rounded-2xl backdrop-blur-lg border border-white/30 flex items-center justify-center animate-float-delayed shadow-xl transform rotate-45">
                    <span className="text-white text-2xl transform -rotate-45">⚡</span>
                  </div>
                  
                  {}
                  <div className="absolute -bottom-10 -left-10 w-22 h-22 bg-gradient-to-br from-green-400/70 to-emerald-500/70 rounded-full backdrop-blur-lg border border-white/30 flex items-center justify-center animate-float shadow-xl">
                    <span className="text-white text-xl">💰</span>
                  </div>
                  
                  {}
                  <div className="absolute -bottom-10 -right-10 w-18 h-18 bg-gradient-to-br from-orange-400/70 to-red-500/70 rounded-2xl backdrop-blur-lg border border-white/30 flex items-center justify-center animate-float-delayed shadow-xl transform -rotate-12">
                    <span className="text-white text-xl">🚚</span>
                  </div>
                </div>

                {}
                <div className="absolute inset-0 -m-20">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-blue-400/60 rounded-full animate-ping"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-400/60 rounded-full animate-ping animation-delay-2000"></div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-400/60 rounded-full animate-ping animation-delay-4000"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-pink-400/60 rounded-full animate-ping animation-delay-6000"></div>
                </div>

                {}
                <div className="absolute -top-24 -right-24 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-xl animate-blob"></div>
                <div className="absolute -bottom-24 -left-24 w-40 h-40 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 -right-28 w-20 h-20 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full blur-lg animate-float"></div>
                <div className="absolute top-1/2 -left-28 w-24 h-24 bg-gradient-to-br from-orange-400/30 to-red-500/30 rounded-full blur-lg animate-float-delayed"></div>

                {}
                <div className="absolute inset-0 scale-125">
                  <svg className="w-full h-full opacity-30" viewBox="0 0 200 200">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#A855F7" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <circle cx="100" cy="100" r="80" fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-spin" style={{ animationDuration: '20s' }} />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="3,3" className="animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                  </svg>
                </div>

              </div>
            </div>

          </div>
        </div>

        {}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                🔧
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">15,000+</div>
              <div className="text-slate-600 font-medium">Запчастей в каталоге</div>
            </div>

            {}
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                🏪
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
              <div className="text-slate-600 font-medium">Поставщиков из ОАЭ</div>
            </div>

            {}
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                ⭐
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">98%</div>
              <div className="text-slate-600 font-medium">Довольных клиентов</div>
            </div>

            {}
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                📞
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">24/7</div>
              <div className="text-slate-600 font-medium">Поддержка клиентов</div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Для кого наша платформа?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Решаем задачи автобизнеса и частных автовладельцев
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {}
            <div className="group relative p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl border border-blue-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">🏢</div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                  🏪
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Для бизнеса (B2B)</h3>
                <ul className="space-y-3 text-slate-700 mb-6">
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Автосервисы и СТО</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Магазины автозапчастей</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Оптовые покупатели</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Корпоративные клиенты</span>
                  </li>
                </ul>
                <div className="p-4 bg-white/70 rounded-xl">
                  <p className="text-sm text-slate-600">
                    💡 <strong>Особые условия:</strong> Скидки от объема, отсрочка платежа, персональный менеджер
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="group relative p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl border border-green-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">🚗</div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                  👤
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Для частных лиц (B2C)</h3>
                <ul className="space-y-3 text-slate-700 mb-6">
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Владельцы автомобилей</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Любители тюнинга</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Коллекционеры редких авто</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Мастера-одиночки</span>
                  </li>
                </ul>
                <div className="p-4 bg-white/70 rounded-xl">
                  <p className="text-sm text-slate-600">
                    💡 <strong>Преимущества:</strong> Доступ к редким запчастям, экономия денег, удобный поиск
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Почему именно Дубай?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              ОАЭ — крупнейший автомобильный хаб Ближнего Востока с лучшими ценами
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) =>
            <div
              key={index}
              className="group relative p-6 bg-white rounded-3xl border border-slate-100 hover:border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">

                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {benefit.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {}
          <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-100">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl mb-3">🌍</div>
                <h4 className="font-bold text-slate-900 mb-2">Глобальный хаб</h4>
                <p className="text-slate-600 text-sm">Дубай — центр реэкспорта автозапчастей в регионе</p>
              </div>
              <div>
                <div className="text-3xl mb-3">💱</div>
                <h4 className="font-bold text-slate-900 mb-2">Выгодный курс</h4>
                <p className="text-slate-600 text-sm">Стабильная валюта и отсутствие высоких пошлин</p>
              </div>
              <div>
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="font-bold text-slate-900 mb-2">Быстрая логистика</h4>
                <p className="text-slate-600 text-sm">Развитая транспортная инфраструктура ОАЭ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Как это работает?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Простой процесс от поиска до получения запчастей
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) =>
            <div key={index} className="relative">
                {}
                {index < howItWorks.length - 1 &&
              <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 z-0"></div>
              }
                
                <div className="relative z-10 text-center group">
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <div className="text-4xl">{step.icon}</div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">

              <span className="flex items-center space-x-2">
                <span>🚀 Попробовать прямо сейчас</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Наши возможности для бизнеса
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Специальные инструменты и условия для корпоративных клиентов
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl">📊</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Аналитика и отчеты</h3>
                    <p className="text-slate-600">Детальная статистика закупок, анализ поставщиков и прогнозирование потребностей</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl">💳</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Гибкая оплата</h3>
                    <p className="text-slate-600">Отсрочка платежа, аккредитивы, множественные способы оплаты</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white text-xl">🤝</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Персональный менеджер</h3>
                    <p className="text-slate-600">Индивидуальное сопровождение, консультации по подбору, приоритетная поддержка</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl">🔄</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">API интеграция</h3>
                    <p className="text-slate-600">Интеграция с вашими системами учета, автоматизация заказов</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 p-8 bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl text-white">
                <h3 className="text-2xl font-bold mb-6">Хотите стать нашим партнером?</h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Скидки до 15% от объема</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Отсрочка платежа до 30 дней</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Приоритетная обработка заказов</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Персональные условия доставки</span>
                  </li>
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Связаться с менеджером
                </button>
              </div>
              
              {}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Доставка и логистика
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Надежные партнеры и проверенные маршруты доставки
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6">
                ✈️
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Авиадоставка</h3>
              <p className="text-slate-600 mb-4">Быстрая доставка критически важных запчастей</p>
              <div className="text-2xl font-bold text-blue-600 mb-2">3-5 дней</div>
              <p className="text-sm text-slate-500">Экспресс-доставка</p>
            </div>

            <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6">
                🚢
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Морская доставка</h3>
              <p className="text-slate-600 mb-4">Оптимальная для крупных и тяжелых грузов</p>
              <div className="text-2xl font-bold text-green-600 mb-2">7-14 дней</div>
              <p className="text-sm text-slate-500">Стандартная доставка</p>
            </div>

            <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6">
                🚛
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Автодоставка</h3>
              <p className="text-slate-600 mb-4">Сухопутные маршруты через Турцию и Иран</p>
              <div className="text-2xl font-bold text-purple-600 mb-2">10-18 дней</div>
              <p className="text-sm text-slate-500">Экономичная доставка</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Наши логистические партнеры</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>DHL Express - экспресс-доставка</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>FedEx - международная логистика</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Aramex - региональный лидер</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Собственный автопарк в ОАЭ</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <h4 className="text-lg font-bold text-slate-900 mb-4">📦 Отслеживание груза</h4>
                <p className="text-slate-600 mb-4">Полная прозрачность доставки от склада до получателя</p>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>SMS и Email уведомления</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500 mt-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span>Онлайн-трекинг 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                О нашей компании
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Мы — команда профессионалов с 10+ летним опытом в автомобильной индустрии. 
                Наша миссия — сделать качественные автозапчасти доступными для каждого.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10+</div>
                  <p className="text-slate-600">Лет опыта</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                  <p className="text-slate-600">Поставщиков</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                  <p className="text-slate-600">Стран доставки</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <p className="text-slate-600">Поддержка</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-slate-700">Официальные дилерские договоры с ОАЭ</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-slate-700">Собственные складские помещения в Дубае</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-slate-700">Команда экспертов по подбору запчастей</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-slate-700">Сертификация ISO 9001:2015</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Отзывы наших клиентов</h3>
                
                <div className="relative h-64 overflow-hidden">
                  {testimonials.map((testimonial, index) =>
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-500 ${
                    index === currentTestimonial ?
                    'opacity-100 translate-x-0' :
                    index < currentTestimonial ?
                    'opacity-0 -translate-x-full' :
                    'opacity-0 translate-x-full'}`
                    }>

                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold">{testimonial.name}</h4>
                          <p className="text-blue-300 text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-slate-300 italic leading-relaxed">
                        "{testimonial.comment}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-2 mt-6">
                  {testimonials.map((_, index) =>
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-white' : 'bg-white/30'}`
                    }
                    onClick={() => setCurrentTestimonial(index)} />

                  )}
                </div>
              </div>
              
              {}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Часто задаваемые вопросы
            </h2>
            <p className="text-xl text-slate-600">
              Ответы на популярные вопросы о нашем сервисе
            </p>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, index) =>
            <div
              key={index}
              className="p-6 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">

                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  {item.question}
                </h3>
                <p className="text-slate-600 leading-relaxed ml-11">
                  {item.answer}
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-6">Не нашли ответ на свой вопрос?</p>
            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center space-x-2">
                <span>💬 Связаться с поддержкой</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Готовы начать экономить на автозапчастях?
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed">
            Присоединяйтесь к тысячам довольных клиентов, которые уже экономят 
            <span className="text-green-400 font-bold"> до 50%</span> на покупке запчастей
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95">

              <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl blur opacity-0 group-hover:opacity-70 transition-opacity duration-300"></span>
              <span className="relative flex items-center space-x-3">
                <span>🚀 Начать поиск запчастей</span>
              </span>
            </button>
            
            <button className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <span className="flex items-center space-x-3">
                <span>📞 Получить консультацию</span>
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-4 text-center">
              <div className="text-2xl font-bold text-white">30-50%</div>
              <div className="text-slate-300 text-sm">Экономия</div>
            </div>
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-4 text-center">
              <div className="text-2xl font-bold text-white">7-14</div>
              <div className="text-slate-300 text-sm">Дней доставка</div>
            </div>
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-4 text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-slate-300 text-sm">Поставщиков</div>
            </div>
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-4 text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-slate-300 text-sm">Поддержка</div>
            </div>
          </div>
        </div>
      </section>

      {}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-6">Auto Parts UAE</h3>
              <p className="text-slate-400 mb-4 leading-relaxed">
                Ваш надежный партнер в поиске и поставке автозапчастей из ОАЭ.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  📧
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors cursor-pointer">
                  📱
                </div>
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-800 transition-colors cursor-pointer">
                  📘
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Услуги</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">Поиск запчастей</li>
                <li className="hover:text-white transition-colors cursor-pointer">Доставка</li>
                <li className="hover:text-white transition-colors cursor-pointer">Консультации</li>
                <li className="hover:text-white transition-colors cursor-pointer">B2B решения</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Компания</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">О нас</li>
                <li className="hover:text-white transition-colors cursor-pointer">Контакты</li>
                <li className="hover:text-white transition-colors cursor-pointer">Карьера</li>
                <li className="hover:text-white transition-colors cursor-pointer">Блог</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Поддержка</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">Помощь</li>
                <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
                <li className="hover:text-white transition-colors cursor-pointer">Условия</li>
                <li className="hover:text-white transition-colors cursor-pointer">Конфиденциальность</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 Auto Parts UAE. Все права защищены.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">🇦🇪 Дубай, ОАЭ</span>
              <span className="text-slate-400 text-sm">🇷🇺 Москва, РФ</span>
            </div>
          </div>
        </div>
      </footer>
    </div>);

};

export default LandingPage;