# Руководство по сидированию данных vPIC

## Обзор

Система сидирования данных о транспортных средствах использует **гибридный подход** с **интеграцией в архитектуру проекта**:

1. **Скачивание через API** → сохранение в JSON файлы
2. **Сидирование из JSON** → загрузка в PostgreSQL через **UoW паттерн**
3. **Периодическое обновление** → через scheduler (опционально)

**Ключевая особенность:** сидеры используют тот же **Unit of Work** паттерн, что и остальные сервисы проекта, обеспечивая единообразие архитектуры.

## Быстрый старт

### Автоматическое сидирование (Production)
```bash
# В production - все происходит автоматически при запуске приложения
./entry.sh
```

Автоматическое сидирование включает:
1. Запуск миграций Alembic
2. **Автоматическая загрузка данных** из vPIC API (если JSON файлы отсутствуют)
3. **Автоматическое сидирование** базы данных (только если таблицы пустые)
4. Запуск приложения

### Ручное сидирование (Development)

### 1. Установка зависимостей
```bash
cd backend
pip install -r requirements.txt
```

### 2. Автоматическое сидирование одной командой
```bash
# Из папки backend
python scripts/auto_seed.py
```

### 3. Ручное поэтапное сидирование
```bash
# Скачивание данных из vPIC API
python scripts/download_vpic_data.py

# Запуск миграций
cd src
alembic upgrade head

# Сидирование базы данных
python -m database.seeders.run_all_seeders
```

### 4. Проверка результата
```bash
cd backend/src
python -m database.seeders.run_all_seeders --stats
```

## Структура данных

### Таблицы в базе:

1. **manufacturers** - Производители (Toyota Motor Corp, BMW AG, etc.)
2. **makes** - Бренды/марки (Toyota, BMW, Mercedes, etc.)
3. **manufacturer_make** - Связи многие-ко-многим между производителями и брендами
4. **vehicle_types** - Типы ТС (Passenger Car, Truck, Motorcycle, etc.)
5. **models** - Модели (Camry, X5, C-Class, etc.)
6. **model_years** - Года выпуска для каждой модели

### Внешние ключи:

- `models.make_id` → `makes.make_id`
- `model_years.model_id` → `models.model_id`
- `model_years.vehicle_type_id` → `vehicle_types.vehicle_type_id`
- `manufacturer_make.manufacturer_id` → `manufacturers.manufacturer_id`
- `manufacturer_make.make_id` → `makes.make_id`

## Рекомендуемые индексы

Добавьте в миграцию:

```sql
-- Для уникальности моделей
CREATE UNIQUE INDEX idx_models_make_model ON models (make_id, model_name);

-- Для уникальности типов ТС
CREATE UNIQUE INDEX idx_vehicle_types_name ON vehicle_types (name);

-- Для поиска по брендам
CREATE INDEX idx_makes_name ON makes USING gin (make_name gin_trgm_ops);

-- Для поиска по моделям
CREATE INDEX idx_models_name ON models USING gin (model_name gin_trgm_ops);
```

## Интеграция с архитектурой проекта

### Использование UoW в сидерах

```python
# Сидеры используют тот же UoW, что и сервисы
class ManufacturersSeeder(BaseSeeder):
    def __init__(self, uow: UoW):
        self.uow = uow
        self.session = uow.session
    
    async def seed(self):
        # ... подготовка данных
        await self.session.execute(stmt)
        await self.commit()  # Использует uow.commit()
```

### Запуск через DI (как сервисы)

```python
# Можно создать сервис для сидирования
async def get_seeder_service(uow: UoW = Depends(get_uow)) -> SeederService:
    return SeederService(uow)

# В endpoints
@router.post("/admin/seed-vehicles")
async def seed_vehicles(seeder_service: SeederService = Depends(get_seeder_service)):
    await seeder_service.seed_all()
```

## Использование в API

### Пример поиска совместимых моделей:

```python
# В сервисе (следуя архитектуре проекта)
class VehicleService:
    def __init__(self, uow: UoW):
        self.uow = uow
    
    async def find_bmw_models_2020(self):
        result = await self.uow.session.execute(
            select(Model, ModelYear)
            .join(Make)
            .join(ModelYear)
            .where(
                Make.make_name.ilike('%BMW%'),
                ModelYear.year == 2020
            )
        )
        return result.fetchall()

# В DI
async def get_vehicle_service(uow: UoW = Depends(get_uow)) -> VehicleService:
    return VehicleService(uow)
```

### Поиск по VIN (будущая функциональность):

```python
# Декодирование VIN через vPIC API
async def decode_vin(vin: str):
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/{vin}?format=json"
    # ... обработка ответа
```

## Периодическое обновление

### Настройка scheduler'а (опционально):

```python
# В scheduler/__init__.py
def init_scheduler():
    scheduler = AsyncIOScheduler()
    
    # Еженедельное обновление справочников
    scheduler.add_job(
        func=update_vpic_data,
        trigger="cron",
        day_of_week=0,  # Воскресенье
        hour=3,
        minute=0,
        id="vpic_update",
    )
    
    scheduler.start()
    return scheduler
```

## Что НЕ входит в vPIC

❌ **vPIC НЕ содержит:**
- Каталоги запчастей (OEM номера)
- Взаимозаменяемость деталей
- Применимость запчастей к конкретным моделям
- Цены на запчасти

✅ **Для каталогов запчастей используйте:**
- TecDoc API
- ACES/PIES данные
- Aftermarket каталоги (например, AutoZone API)

## Интеграция с продуктами

### В таблице products:

```sql
-- Добавьте поля для привязки к vPIC данным
ALTER TABLE products ADD COLUMN make_id INTEGER REFERENCES makes(make_id);
ALTER TABLE products ADD COLUMN model_id INTEGER REFERENCES models(model_id);
ALTER TABLE products ADD COLUMN year_from INTEGER;
ALTER TABLE products ADD COLUMN year_to INTEGER;
ALTER TABLE products ADD COLUMN vehicle_type_id INTEGER REFERENCES vehicle_types(vehicle_type_id);
```

### Поиск запчастей:

```python
# В ProductService (существующий сервис)
class ProductService:
    def __init__(self, uow: UoW, product_repo: ProductInterface):
        self.uow = uow
        self.product_repo = product_repo
    
    async def find_parts_for_vehicle(self, make_name: str, model_name: str, year: int):
        """Поиск запчастей для конкретного автомобиля"""
        result = await self.uow.session.execute(
            select(Product)
            .join(Make, Product.make_id == Make.make_id)
            .join(Model, Product.model_id == Model.model_id)
            .where(
                Make.make_name == make_name,
                Model.model_name == model_name,
                Product.year_from <= year,
                Product.year_to >= year
            )
        )
        return result.fetchall()
```

## Troubleshooting

### Ошибка подключения к базе:
```bash
# Проверьте настройки в .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hackathon
DB_USER=postgres
DB_PASSWORD=secret
```

### Медленное скачивание:
- Увеличьте `delay_between_requests` в `download_vpic_data.py`
- Уменьшите количество одновременных запросов
- Рассмотрите возможность скачивания полной базы vPIC (.bak файл)

### Ошибки при сидировании:
```bash
# Проверьте логи
python -m database.seeders.run_all_seeders --seeder manufacturers

# Очистите таблицы и попробуйте снова (ОСТОРОЖНО!)
# TRUNCATE manufacturers, makes, manufacturer_make, vehicle_types, models, model_years CASCADE;
```

## Автоматическое сидирование в Production

### Как это работает

1. **entry.sh** автоматически запускает `scripts/auto_seed.py` после миграций
2. **auto_seed.py** проверяет наличие JSON файлов с данными
3. Если файлов нет - автоматически загружает их из vPIC API
4. Запускает сидирование только если таблицы пустые
5. JSON файлы исключены из Git (`.gitignore`)

### Преимущества автоматической системы

✅ **Не требует ручного вмешательства** при деплое  
✅ **Не засоряет Git** большими JSON файлами  
✅ **Безопасно** - не затирает существующие данные  
✅ **Быстро** - пропускает сидирование если данные уже есть  
✅ **Отказоустойчиво** - продолжает работу даже если загрузка не удалась  

### Файлы системы автоматического сидирования

```
backend/
├── entry.sh                          # Главный скрипт запуска (обновлен)
├── scripts/
│   ├── download_vpic_data.py         # Загрузка данных из vPIC API
│   └── auto_seed.py                  # Автоматическое сидирование (новый)
└── src/database/seeders/
    ├── run_all_seeders.py            # Запуск всех сидеров
    ├── base_seeder.py                # Базовый класс с проверками
    ├── *_seeder.py                   # Конкретные сидеры
    └── data/                         # JSON файлы (игнорируются Git)
        ├── manufacturers.json
        ├── makes.json
        ├── manufacturer_makes.json
        ├── vehicle_types.json
        ├── models.json
        └── model_years.json
```

### Переменные окружения для настройки

```bash
# Эти переменные можно добавить в Docker/производственную среду
# для настройки поведения автоматического сидирования

# Принудительное пересоздание данных (по умолчанию false)
FORCE_SEED=false

# Пропустить загрузку данных (если используете внешний источник)
SKIP_DATA_DOWNLOAD=false

# Пропустить сидирование вообще
SKIP_AUTO_SEED=false
```
