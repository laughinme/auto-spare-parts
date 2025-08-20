import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "./context/useAuth.js";
import Topbar from "./components/Topbar.jsx";
import SupplierTopbar from "./components/supplier/SupplierTopbar.jsx";
import FYP from "./components/fyp/FYP.jsx";
import ProductDetail from "./components/product/ProductDetail.jsx";
import CartPage from "./components/cart/CartPage.jsx";
import OrderPage from "./components/order/OrderPage.jsx";
import SupplierDashboard from "./components/supplier/SupplierDashboard.jsx";
import SupplierStripeOnboarding from "./components/onboarding/SupplierStripeOnboarding.jsx";
import SupplierProducts from "./components/supplier/SupplierProducts.jsx";
import DevTests from "./components/dev/DevTests.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import { MOCK_PRODUCTS } from "./data/mockProducts.js";
import { SUPPLIER_SELF_ID } from "./data/constants.js";
import { createOrdersFromCart } from "./utils/helpers.js";

function App() {
  const { user, isUserLoading, logout } = useAuth();
  
  const [route, setRoute] = useState("fyp");
  const [role, setRole] = useState(null);
  const [buyerType] = useState(null);
  const [garage, setGarage] = useState([]);
  const [supplierProfile] = useState(null);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const productsById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);

  useEffect(() => {
    // Expose route setter globally for navigation from auth/register flows
    window.__setRoute = setRoute;
    return () => {
      if (window.__setRoute === setRoute) window.__setRoute = undefined;
    };
  }, [setRoute]);

  // Hooks must be declared before any early returns
  const activeOrder = useMemo(() => orders.find((o) => o.id === activeOrderId) || null, [orders, activeOrderId]);

  const supplierMetrics = useMemo(() => {
    const myOrders = orders.filter((o) => o.supplierId === SUPPLIER_SELF_ID);
    const gmv = myOrders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.price * it.qty, 0), 0);
    const pending = myOrders.filter((o) => o.status === "Новый").length;
    const mySkus = products.filter((p) => p.supplierId === SUPPLIER_SELF_ID).length;
    const conv = myOrders.length ? Math.min(98, 20 + mySkus) : 0;
    return { gmv, pending, mySkus, orders: myOrders.length, conv };
  }, [orders, products]);

  // Derive role from user object if provided by API
  // Expecting something like user.role === 'supplier' | 'buyer'
  useEffect(() => {
    if (user && (user.role || user.type)) {
      const apiRole = user.role || user.type;
      if (apiRole !== role) setRole(apiRole);
    }
  }, [user, role]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }
  
  const handleAddVehicle = (value) => {
    const v = String(value || "").trim();
    if (!v) return;
    setGarage((prev) => Array.from(new Set([v, ...prev])).slice(0, 6));
  };
  const removeVehicle = (value) => setGarage((prev) => prev.filter((x) => x !== value));

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { productId: product.id, qty: 1 }];
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const created = createOrdersFromCart(cart, productsById);
    if (!created.length) return;
    setOrders((prev) => [...created, ...prev]);
    setCart([]);
    setActiveOrderId(created[0].id);
    setRoute("order");
  };

  const sendChatMessage = (orderId, author, text) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, chat: [...o.chat, { id: `m-${Date.now()}`, author, text, ts: new Date().toISOString() }] }
          : o
      )
    );

    if (author === "buyer") {
      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  chat: [
                    ...o.chat,
                    {
                      id: `m-${Date.now()}-r`,
                      author: "seller",
                      text: "Здравствуйте! Подтверждаю наличие. Уточните VIN или фото детали, пожалуйста.",
                      ts: new Date().toISOString(),
                    },
                  ],
                }
              : o
          )
        );
      }, 650);
    }
  };

  
  
  const showTopbar = route !== "onboarding:supplier_stripe";
  const isSupplierRoute = route.startsWith("supplier:");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      {showTopbar && (
        isSupplierRoute || role === "supplier" ? (
          <SupplierTopbar
            route={route}
            setRoute={setRoute}
            onLogout={logout}
          />
        ) : (
          <Topbar
            route={route}
            setRoute={setRoute}
            role={role}
            cartCount={cart.reduce((a, b) => a + b.qty, 0)}
            isWorkshop={buyerType === "workshop"}
            showSupplierTab={role === "supplier"}
            onLogout={logout}
          />
        )
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {route === "fyp" && (
          <FYP
            role={role}
            buyerType={buyerType}
            garage={garage}
            onAddVehicle={handleAddVehicle}
            onRemoveVehicle={removeVehicle}
            products={products}
            setSelectedProduct={setSelectedProduct}
            setRoute={setRoute}
            onAddToCart={handleAddToCart}
          />
        )}

        {route === "onboarding:supplier_stripe" && (
          <SupplierStripeOnboarding />
        )}

        {route === "product" && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onAdd={() => handleAddToCart(selectedProduct)}
            onBack={() => setRoute("fyp")}
            onChat={() => setRoute("cart")}
          />
        )}

        {route === "cart" && (
          <CartPage cart={cart} productsById={productsById} setCart={setCart} onCheckout={handleCheckout} />
        )}

        {route === "order" && activeOrder && (
          <OrderPage order={activeOrder} onBack={() => setRoute("fyp")} onSend={(t) => sendChatMessage(activeOrder.id, role === "buyer" ? "buyer" : "seller", t)} />
        )}

        {route === "supplier:dashboard" && (
          <SupplierDashboard supplierProfile={supplierProfile} metrics={supplierMetrics} />
        )}

        {route === "supplier:products" && (
          <SupplierProducts products={products} setProducts={setProducts} supplierProfile={supplierProfile} />
        )}

        {route === "tests" && (
          <DevTests />
        )}
      </main>
    </div>
  );
}

const styles = `
.input { @apply px-3 py-2 border rounded-2xl outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition; }
.btn { @apply inline-flex items-center justify-center px-3 py-2 rounded-2xl border text-sm font-medium transition active:translate-y-[1px]; }
.btn.primary { @apply border-sky-700 bg-sky-600 text-white hover:bg-sky-700 shadow-md shadow-sky-600/20; }
.btn.secondary { @apply border-slate-300 bg-white hover:bg-slate-50; }
.btn.ghost { @apply bg-transparent border-slate-200 hover:bg-slate-100; }
.chip { @apply px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-sm; }
.chip--active { @apply border-slate-900 bg-slate-900 text-white; }
.chip--active-soft { @apply border-sky-600 bg-sky-50 text-sky-800; }
.card { @apply bg-white rounded-3xl shadow-lg border border-slate-100; }
.segmented { @apply inline-flex rounded-xl overflow-hidden border border-slate-200; }
.seg { @apply px-3 py-1.5 text-sm bg-white hover:bg-slate-50; }
.seg--active { @apply bg-slate-900 text-white; }
`;

const StyleInjector = () => <style dangerouslySetInnerHTML={{ __html: styles }} />;

export default function WrappedApp() {
  return (
    <>
      <StyleInjector />
      <App />
    </>
  );
}