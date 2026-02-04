import os
import random
import mimetypes
from decimal import Decimal
from datetime import datetime, UTC, timedelta
from pathlib import Path

from sqlalchemy import delete, select

from core.crypto import hash_password
from core.media_storage import get_media_storage, MediaStorageError
from domain.organizations import OrganizationType, KycStatus, PayoutSchedule, MembershipRole
from domain.products import ProductStatus, ProductCondition, ProductOriginality, StockType
from domain.orders import OrderStatus
from domain.payments import PaymentStatus
from domain.carts import CartItemStatus

from .base_seeder import BaseSeeder
from ..relational_db import (
    User,
    Organization,
    OrgMembership,
    Product,
    ProductMedia,
    Cart,
    CartItem,
    Order,
    OrderItem,
    ProductReview,
    SellerReview,
    GarageVehicle,
    Make,
    Model,
    ModelYear,
    Language,
    Role,
    UserRole,
)


class MarketplaceSeeder(BaseSeeder):
    """Seeder for demo marketplace data (users, orgs, products, carts, orders, reviews, garage)."""

    def __init__(self, uow, force: bool = False):
        super().__init__(uow, force=force)

        seed = int(os.getenv("SEED_RANDOM_SEED", "42"))
        self.rng = random.Random(seed)

        self.suppliers_count = int(os.getenv("SEED_SUPPLIERS_COUNT", "5"))
        self.buyers_count = int(os.getenv("SEED_BUYERS_COUNT", "12"))
        self.products_count = int(os.getenv("SEED_PRODUCTS_COUNT", "120"))
        self.orders_count = int(os.getenv("SEED_ORDERS_COUNT", "40"))
        self.max_media_per_product = int(os.getenv("SEED_MAX_MEDIA_PER_PRODUCT", "3"))

        self.assets_dir = Path(__file__).parent / "assets" / "product_images"

        try:
            self.media_storage = get_media_storage()
        except MediaStorageError as exc:
            self.media_storage = None
            self.log_progress(f"Media storage unavailable: {exc}. Product media seeding will be skipped.")

        self.part_types = [
            "Brake Pads",
            "Oil Filter",
            "Air Filter",
            "Alternator",
            "Radiator",
            "Starter",
            "Spark Plug",
            "Fuel Pump",
            "Control Arm",
            "Shock Absorber",
            "Headlight",
            "Taillight",
            "Bumper",
            "Door Mirror",
            "Timing Belt",
            "Water Pump",
            "Battery",
            "Wheel Bearing",
            "Oxygen Sensor",
            "Muffler",
        ]

        self.order_notes = [
            "Please pack carefully.",
            "Call before delivery.",
            "Leave at the front desk.",
            "Urgent order.",
            "Standard delivery is fine.",
        ]

    async def seed(self) -> None:
        existing_users = await self.get_record_count(User)
        existing_orgs = await self.get_record_count(Organization)
        existing_products = await self.get_record_count(Product)

        if (existing_users or existing_orgs or existing_products) and not self.force:
            self.log_progress("Marketplace data already exists. Use --force to reseed.")
            return

        if self.force:
            await self._purge_marketplace_data()

        makes = (await self.session.execute(select(Make.make_id, Make.make_name))).all()
        if not makes:
            self.log_progress("No makes found. Seed vPIC data first.")
            return

        make_name_by_id = {make_id: make_name for make_id, make_name in makes}

        model_year_rows = (
            await self.session.execute(
                select(
                    ModelYear.model_id,
                    ModelYear.year,
                    ModelYear.vehicle_type_id,
                    Model.make_id,
                ).join(Model, Model.model_id == ModelYear.model_id)
            )
        ).all()

        language_codes = [row[0] for row in (await self.session.execute(select(Language.code))).all()]

        users, suppliers, buyers = await self._seed_users(language_codes)
        await self._seed_user_roles(users, suppliers, buyers)
        orgs = await self._seed_organizations(suppliers)
        await self._seed_org_memberships(orgs, suppliers)

        products = await self._seed_products(orgs, makes)
        await self._seed_product_media(products)

        carts = await self._seed_carts(buyers, products)
        orders, order_items = await self._seed_orders(buyers, products, make_name_by_id)
        await self._seed_reviews(orders, order_items)
        await self._seed_garage(buyers, model_year_rows)

        await self.commit()

        self.log_progress(f"Seeded {len(users)} users, {len(orgs)} orgs, {len(products)} products")
        self.log_progress(f"Seeded {len(carts)} carts, {len(orders)} orders, {len(order_items)} order items")

    async def _purge_marketplace_data(self) -> None:
        self.log_progress("Purging marketplace tables...")
        await self.session.execute(delete(ProductReview))
        await self.session.execute(delete(SellerReview))
        await self.session.execute(delete(OrderItem))
        await self.session.execute(delete(Order))
        await self.session.execute(delete(CartItem))
        await self.session.execute(delete(Cart))
        await self.session.execute(delete(ProductMedia))
        await self.session.execute(delete(GarageVehicle))
        await self.session.execute(delete(Product))
        await self.session.execute(delete(OrgMembership))
        await self.session.execute(delete(Organization))
        await self.session.execute(delete(UserRole))
        await self.session.execute(delete(User))
        await self.commit()

    async def _seed_users(self, language_codes: list[str]) -> tuple[list[User], list[User], list[User]]:
        password_hash = await hash_password("Password123!")

        admins: list[User] = []
        suppliers: list[User] = []
        buyers: list[User] = []

        admin = User(
            email="admin@demo.local",
            password_hash=password_hash,
            username="admin",
            confirmed_at=datetime.now(UTC),
            is_onboarded=True,
        )
        admins.append(admin)

        for idx in range(self.suppliers_count):
            suppliers.append(
                User(
                    email=f"supplier{idx+1}@demo.local",
                    password_hash=password_hash,
                    username=f"supplier_{idx+1}",
                    confirmed_at=datetime.now(UTC),
                    is_onboarded=True,
                    language_code=self.rng.choice(language_codes) if language_codes else None,
                )
            )

        for idx in range(self.buyers_count):
            buyers.append(
                User(
                    email=f"buyer{idx+1}@demo.local",
                    password_hash=password_hash,
                    username=f"buyer_{idx+1}",
                    confirmed_at=datetime.now(UTC),
                    is_onboarded=True,
                    language_code=self.rng.choice(language_codes) if language_codes else None,
                )
            )

        users = admins + suppliers + buyers
        self.session.add_all(users)
        await self.session.flush()

        return users, suppliers, buyers

    async def _seed_user_roles(
        self,
        users: list[User],
        suppliers: list[User],
        buyers: list[User],
    ) -> dict[str, Role]:
        roles = {role.slug: role for role in (await self.session.execute(select(Role))).scalars().all()}
        assignments: list[UserRole] = []

        admin_role = roles.get("admin")
        if admin_role and users:
            assignments.append(UserRole(user_id=users[0].id, role_id=admin_role.id))

        supplier_role = roles.get("supplier")
        buyer_role = roles.get("buyer")

        for user in suppliers:
            if supplier_role:
                assignments.append(UserRole(user_id=user.id, role_id=supplier_role.id))

        for user in buyers:
            if buyer_role:
                assignments.append(UserRole(user_id=user.id, role_id=buyer_role.id))

        if assignments:
            self.session.add_all(assignments)
            await self.session.flush()

        return roles

    async def _seed_organizations(self, suppliers: list[User]) -> list[Organization]:
        countries = ["US", "DE", "FR", "GB", "TR"]
        schedules = [PayoutSchedule.WEEKLY, PayoutSchedule.MONTHLY, PayoutSchedule.DAILY]
        statuses = [KycStatus.NOT_STARTED, KycStatus.PENDING, KycStatus.VERIFIED]

        orgs: list[Organization] = []
        for idx, supplier in enumerate(suppliers, start=1):
            name = f"Auto Parts Hub {idx}"
            orgs.append(
                Organization(
                    owner_user_id=supplier.id,
                    name=name,
                    type=OrganizationType.SUPPLIER,
                    country=self.rng.choice(countries),
                    address=f"{100 + idx} Market Street",
                    kyc_status=self.rng.choice(statuses),
                    payout_schedule=self.rng.choice(schedules),
                )
            )

        self.session.add_all(orgs)
        await self.session.flush()
        return orgs

    async def _seed_org_memberships(self, orgs: list[Organization], suppliers: list[User]) -> None:
        memberships: list[OrgMembership] = []
        now = datetime.now(UTC)
        for org, owner in zip(orgs, suppliers):
            memberships.append(
                OrgMembership(
                    org_id=org.id,
                    user_id=owner.id,
                    role=MembershipRole.OWNER,
                    invited_by=None,
                    invited_at=now,
                    accepted_at=now,
                )
            )

        if memberships:
            self.session.add_all(memberships)
            await self.session.flush()

    async def _seed_products(self, orgs: list[Organization], makes: list[tuple[int, str]]) -> list[Product]:
        if not orgs:
            self.log_progress("No organizations found for product seeding.")
            return []

        products: list[Product] = []
        make_ids = [make_id for make_id, _ in makes]
        make_names = {make_id: name for make_id, name in makes}

        for idx in range(self.products_count):
            org = orgs[idx % len(orgs)]
            make_id = self.rng.choice(make_ids)
            make_name = make_names.get(make_id, "Auto")
            part_type = self.rng.choice(self.part_types)

            stock_type = self.rng.choices(
                [StockType.STOCK, StockType.UNIQUE],
                weights=[0.85, 0.15],
                k=1,
            )[0]
            condition = self.rng.choices(
                [ProductCondition.NEW, ProductCondition.USED],
                weights=[0.7, 0.3],
                k=1,
            )[0]
            originality = self.rng.choices(
                [ProductOriginality.OEM, ProductOriginality.AFTERMARKET],
                weights=[0.6, 0.4],
                k=1,
            )[0]

            if stock_type == StockType.UNIQUE:
                quantity_original = 1
                quantity_on_hand = self.rng.choice([0, 1])
                allow_cart = False
            else:
                quantity_original = self.rng.randint(5, 50)
                quantity_on_hand = self.rng.randint(1, quantity_original)
                allow_cart = self.rng.random() < 0.85

            status = ProductStatus.PUBLISHED if quantity_on_hand > 0 else ProductStatus.DRAFT

            part_number = f"{make_name[:3].upper()}-{self.rng.randint(10000, 99999)}"
            title = f"{make_name} {part_type}"
            description = f"{part_type} compatible with {make_name} vehicles."

            price_base = self.rng.randint(25, 450)
            price = Decimal(f"{price_base}.{self.rng.randint(0,99):02d}")

            products.append(
                Product(
                    org_id=org.id,
                    make_id=make_id,
                    title=title,
                    description=description,
                    part_number=part_number,
                    price=price,
                    stock_type=stock_type,
                    quantity_original=quantity_original,
                    quantity_on_hand=quantity_on_hand,
                    condition=condition,
                    originality=originality,
                    status=status,
                    allow_cart=allow_cart,
                    allow_chat=True,
                )
            )

        self.session.add_all(products)
        await self.session.flush()
        return products

    async def _seed_product_media(self, products: list[Product]) -> None:
        if not self.media_storage:
            return

        if not self.assets_dir.exists():
            self.log_progress(f"No images folder found at {self.assets_dir}. Skipping media seeding.")
            return

        image_files = [
            path for path in sorted(self.assets_dir.iterdir())
            if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
        ]
        if not image_files:
            self.log_progress("No image files found for product media seeding.")
            return

        images: list[tuple[Path, bytes, str | None]] = []
        for path in image_files:
            content_type, _ = mimetypes.guess_type(path.name)
            try:
                images.append((path, path.read_bytes(), content_type))
            except Exception as exc:
                self.log_progress(f"Failed to read {path.name}: {exc}")

        if not images:
            return

        media_records: list[ProductMedia] = []
        for idx, product in enumerate(products):
            for offset in range(min(self.max_media_per_product, len(images))):
                path, content, content_type = images[(idx + offset) % len(images)]
                key = self.media_storage.build_key(
                    "seed",
                    "products",
                    str(product.id),
                    f"{offset+1}{path.suffix.lower()}",
                )
                try:
                    await self.media_storage.upload_bytes(key, content, content_type=content_type)
                except Exception as exc:
                    self.log_progress(f"Upload failed for {path.name}: {exc}")
                    continue

                media_records.append(
                    ProductMedia(
                        product_id=product.id,
                        url=self.media_storage.build_url(key),
                        alt=product.title,
                    )
                )

        if media_records:
            self.session.add_all(media_records)
            await self.session.flush()

    async def _seed_carts(self, buyers: list[User], products: list[Product]) -> list[Cart]:
        if not buyers or not products:
            return []

        carts = [Cart(user_id=buyer.id) for buyer in buyers]
        self.session.add_all(carts)
        await self.session.flush()

        items: list[CartItem] = []
        for cart in carts:
            pick_count = self.rng.randint(1, min(3, len(products)))
            for product in self.rng.sample(products, pick_count):
                max_qty = 1 if product.stock_type == StockType.UNIQUE else min(3, product.quantity_on_hand or 1)
                quantity = self.rng.randint(1, max_qty)
                items.append(
                    CartItem(
                        cart_id=cart.id,
                        product_id=product.id,
                        seller_org_id=product.org_id,
                        title=product.title,
                        description=product.description or "",
                        part_number=product.part_number,
                        quantity=quantity,
                        unit_price=product.price,
                        status=CartItemStatus.ACTIVE,
                    )
                )

        if items:
            self.session.add_all(items)
            await self.session.flush()

        return carts

    async def _seed_orders(
        self,
        buyers: list[User],
        products: list[Product],
        make_name_by_id: dict[int, str],
    ) -> tuple[list[Order], list[OrderItem]]:
        if not buyers or not products:
            return [], []

        published_products = [p for p in products if p.status == ProductStatus.PUBLISHED]
        product_pool = published_products or products

        orders: list[Order] = []
        order_items: list[OrderItem] = []

        for _ in range(self.orders_count):
            buyer = self.rng.choice(buyers)
            item_count = self.rng.randint(1, min(3, len(product_pool)))
            picked_products = self.rng.sample(product_pool, item_count)

            payment_status = self.rng.choices(
                [PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.CANCELLED, PaymentStatus.FAILED, PaymentStatus.REFUNDED],
                weights=[0.55, 0.25, 0.1, 0.05, 0.05],
                k=1,
            )[0]

            order = Order(
                buyer_id=buyer.id,
                payment_status=payment_status,
                total_amount=Decimal("0.00"),
                total_items=0,
                unique_items=len(picked_products),
                notes=self.rng.choice(self.order_notes),
                shipping_address="123 Main Street, Springfield",
            )
            orders.append(order)
            self.session.add(order)
            await self.session.flush()

            total_amount = Decimal("0.00")
            total_items = 0
            for product in picked_products:
                quantity = 1 if product.stock_type == StockType.UNIQUE else self.rng.randint(1, 3)
                unit_price = product.price
                total_price = unit_price * quantity
                total_amount += total_price
                total_items += quantity

                if payment_status == PaymentStatus.PAID:
                    item_status = self.rng.choices(
                        [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
                        weights=[0.2, 0.3, 0.3, 0.2],
                        k=1,
                    )[0]
                elif payment_status in {PaymentStatus.CANCELLED, PaymentStatus.FAILED}:
                    item_status = OrderStatus.CANCELLED
                elif payment_status == PaymentStatus.REFUNDED:
                    item_status = OrderStatus.REFUNDED
                else:
                    item_status = OrderStatus.PENDING

                shipped_at = None
                delivered_at = None
                if item_status in {OrderStatus.SHIPPED, OrderStatus.DELIVERED}:
                    shipped_at = datetime.now(UTC) - timedelta(days=self.rng.randint(1, 10))
                if item_status == OrderStatus.DELIVERED:
                    delivered_at = shipped_at + timedelta(days=self.rng.randint(1, 5)) if shipped_at else None

                order_items.append(
                    OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        seller_org_id=product.org_id,
                        cart_item_id=None,
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=total_price,
                        product_make_id=product.make_id,
                        product_make_name=make_name_by_id.get(product.make_id, "Unknown"),
                        product_part_number=product.part_number,
                        product_condition=product.condition,
                        product_title=product.title,
                        product_description=product.description,
                        carrier_code="UPS" if item_status in {OrderStatus.SHIPPED, OrderStatus.DELIVERED} else None,
                        tracking_number=str(self.rng.randint(1000000000, 9999999999)) if item_status in {OrderStatus.SHIPPED, OrderStatus.DELIVERED} else None,
                        tracking_url=None,
                        shipped_at=shipped_at,
                        delivered_at=delivered_at,
                        status=item_status,
                    )
                )

            order.total_amount = total_amount
            order.total_items = total_items

        if order_items:
            self.session.add_all(order_items)
            await self.session.flush()

        return orders, order_items

    async def _seed_reviews(self, orders: list[Order], order_items: list[OrderItem]) -> None:
        if not orders or not order_items:
            return

        order_buyer_map = {order.id: order.buyer_id for order in orders}
        delivered_items = [item for item in order_items if item.status == OrderStatus.DELIVERED]

        product_reviews: list[ProductReview] = []
        seller_reviews: list[SellerReview] = []
        used_product_pairs: set[tuple[str, str]] = set()

        for item in delivered_items:
            if self.rng.random() > 0.6:
                continue

            buyer_id = order_buyer_map.get(item.order_id)
            if not buyer_id or not item.product_id:
                continue

            product_key = (str(buyer_id), str(item.product_id))
            if product_key not in used_product_pairs:
                used_product_pairs.add(product_key)
                product_reviews.append(
                    ProductReview(
                        order_item_id=item.id,
                        product_id=item.product_id,
                        seller_org_id=item.seller_org_id,
                        reviewer_user_id=buyer_id,
                        rating=self.rng.randint(3, 5),
                        title="Great part",
                        body="Fits perfectly and works as expected.",
                    )
                )

            seller_reviews.append(
                SellerReview(
                    order_item_id=item.id,
                    seller_org_id=item.seller_org_id,
                    reviewer_user_id=buyer_id,
                    rating=self.rng.randint(3, 5),
                    title="Good seller",
                    body="Fast shipping and clear communication.",
                )
            )

        if product_reviews:
            self.session.add_all(product_reviews)
        if seller_reviews:
            self.session.add_all(seller_reviews)
        if product_reviews or seller_reviews:
            await self.session.flush()

    async def _seed_garage(self, buyers: list[User], model_year_rows: list[tuple[int, int, int | None, int]]) -> None:
        if not buyers or not model_year_rows:
            return

        garage_entries: list[GarageVehicle] = []
        for buyer in buyers:
            for _ in range(self.rng.randint(1, 2)):
                model_id, year, vehicle_type_id, make_id = self.rng.choice(model_year_rows)
                garage_entries.append(
                    GarageVehicle(
                        user_id=buyer.id,
                        make_id=make_id,
                        model_id=model_id,
                        year=year,
                        vehicle_type_id=vehicle_type_id,
                        vin=None,
                        vin_decoded=None,
                        comment="Seeded vehicle",
                    )
                )

        if garage_entries:
            self.session.add_all(garage_entries)
            await self.session.flush()
