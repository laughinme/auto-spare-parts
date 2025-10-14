import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./context/useAuth.js";
import Topbar from "./components/Topbar.jsx";
import SupplierTopbar from "./components/supplier/SupplierTopbar.jsx";
import FYP from "./components/fyp/FYP.jsx";
import GarageWidget from "./components/fyp/garage/GarageWidget.jsx";
import ProductDetail from "./components/product/ProductDetail.jsx";
import CartPage from "./components/cart/CartPage.jsx";
import OrderPage from "./components/order/OrderPage.jsx";
import ChatPage from "./components/chat/ChatPage.jsx";
import SupplierChatPage from "./components/supplier/SupplierChatPage.jsx";
import SupplierDashboard from "./components/supplier/SupplierDashboard.jsx";
import SupplierStripeOnboarding from "./components/onboarding/SupplierStripeOnboarding.jsx";
import SupplierProducts from "./components/supplier/SupplierProducts.jsx";
import SupplierProductCreate from "./components/supplier/SupplierProductCreate.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import LandingPage from "./components/landing/LandingPage.jsx";
import { SUPPLIER_SELF_ID } from "./data/constants.js";
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "./api/api.js";
import { createOrdersFromCart } from "./utils/helpers.js";

const EMPTY_CART = {
  id: null,
  items: [],
  unique_items: 0,
  total_items: 0,
  total_amount: 0,
};

function App() {
  const { user, isUserLoading, logout, isRestoringSession } = useAuth();
  
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setShowLanding(true); 
    logout();
  };
  
  const [route, setRoute] = useState("fyp");
  const [previousRoute, setPreviousRoute] = useState("fyp");
  const [role, setRole] = useState(null);
  const [hasInitializedRole, setHasInitializedRole] = useState(false);
  const [buyerType] = useState(null);
  const [garage, setGarage] = useState([]);
  const [supplierProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const productsById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(EMPTY_CART);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartUpdating, setIsCartUpdating] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  
  const [showLanding, setShowLanding] = useState(true);
  const normalizeCart = useCallback((cartData) => {
    if (!cartData) return { ...EMPTY_CART };
    const items = Array.isArray(cartData.items) ? cartData.items : [];
    const totalAmount = Number(cartData.total_amount ?? 0);
    const totalItems = Number(cartData.total_items ?? 0);
    const uniqueItems = Number(cartData.unique_items ?? 0);
    return {
      id: cartData.id ?? null,
      items,
      unique_items: Number.isNaN(uniqueItems) ? 0 : uniqueItems,
      total_items: Number.isNaN(totalItems) ? 0 : totalItems,
      total_amount: Number.isNaN(totalAmount) ? 0 : totalAmount,
    };
  }, []);

  const updateCartState = useCallback((cartData) => {
    setCart(normalizeCart(cartData));
  }, [normalizeCart]);
  
  useEffect(() => {
    window.__setRoute = setRoute;
    return () => {
      if (window.__setRoute === setRoute) window.__setRoute = undefined;
    };
  }, [setRoute]);

  const activeOrder = useMemo(() => orders.find((o) => o.id === activeOrderId) || null, [orders, activeOrderId]);

  const supplierMetrics = useMemo(() => {
    const myOrders = orders.filter((o) => o.supplierId === SUPPLIER_SELF_ID);
    const gmv = myOrders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.price * it.qty, 0), 0);
    const pending = myOrders.filter((o) => o.status === "Новый").length;
    const mySkus = products.filter((p) => p.supplierId === SUPPLIER_SELF_ID).length;
    const conv = myOrders.length ? Math.min(98, 20 + mySkus) : 0;
    return { gmv, pending, mySkus, orders: myOrders.length, conv };
  }, [orders, products]);

  useEffect(() => {
    if (!user) {
      setHasInitializedRole(false);
      setRole(null);
      localStorage.removeItem('userRole'); 
      updateCartState(null);
      setIsCartLoading(false);
      setIsCartUpdating(false);
      console.log('User logged out, resetting role and initialization flag');
    } else {
      setShowLanding(false); 
    }
  }, [user, updateCartState]);

  useEffect(() => {
    if (user) {
      
      const savedRole = localStorage.getItem('userRole');
      let apiRole = savedRole || user.role || user.type || user.user_type;
      
      if (!apiRole) {
        if (user.email && (user.email.includes('supplier') || user.email.includes('vendor') || user.email.includes('shop') || user.email.includes('seller'))) {
          apiRole = 'supplier';
        } else if (user.is_supplier === true) {
          apiRole = 'supplier';
        } else {
          apiRole = 'buyer';
          
        }
      }
      
      if (apiRole !== role) {
        setRole(apiRole);
        
        if (!hasInitializedRole) {
          setHasInitializedRole(true);
          if (apiRole === "supplier") {
            if (savedRole === 'supplier') {
              setRoute("onboarding:supplier_stripe");
            } else {
              setRoute("supplier:dashboard"); 
            }
          } else {
            console.log('Redirecting buyer to fyp');
            setRoute("fyp");
          }
        }
      }
    }
  }, [user, role, hasInitializedRole, route]);

  useEffect(() => {
    if (role === "supplier") {
      console.log('Supplier route protection activated for route:', route);
      const buyerOnlyRoutes = ["fyp", "cart"];
      if (buyerOnlyRoutes.includes(route)) {
        console.log('Redirecting supplier from buyer route:', route, 'to dashboard');
        setRoute("supplier:dashboard");
      }
      if (route === "chat") {
        console.log('Redirecting supplier from general chat to supplier chat');
        setRoute("supplier:chat");
      }
    }
  }, [role, route]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const loadCartData = async () => {
      setIsCartLoading(true);
      try {
        const data = await getCart();
        if (active) updateCartState(data);
      } catch (err) {
        console.error("Не удалось загрузить корзину", err);
        if (active) updateCartState(null);
      } finally {
        if (active) setIsCartLoading(false);
      }
    };
    loadCartData();
    return () => {
      active = false;
    };
  }, [user, updateCartState]);

  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Загрузка сессии...</p>
      </div>
    );
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Загрузка пользователя...</p>
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <AuthPage />;
  }
  
  const handleAddVehicle = (value) => {
    const v = String(value || "").trim();
    if (!v) return;
    setGarage((prev) => Array.from(new Set([v, ...prev])).slice(0, 6));
  };
  const removeVehicle = (value) => setGarage((prev) => prev.filter((x) => x !== value));

  const navigateTo = (newRoute) => {
    console.log("navigateTo called:", route, "->", newRoute);
    setPreviousRoute(route);
    setRoute(newRoute);
  };

  const navigateBack = () => {
    if (route === "product") {
      setSelectedProduct(null);
    }
    setRoute(previousRoute);
  };


  const handleAddToCart = async (product, quantity = 1) => {
    if (!product?.id) return;

    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === product.id);
      if (index === -1) return [...prev, product];
      const next = [...prev];
      next[index] = { ...next[index], ...product };
      return next;
    });

    setIsCartUpdating(true);
    try {
      const updated = await addCartItem({ productId: product.id, quantity });
      updateCartState(updated);
    } catch (err) {
      console.error("Не удалось добавить товар в корзину", err);
    } finally {
      setIsCartUpdating(false);
    }
  };

  const handleUpdateCartLine = async (itemId, quantity) => {
    if (!itemId) return;
    setIsCartUpdating(true);
    try {
      const updated = await updateCartItem({ itemId, quantity });
      updateCartState(updated);
    } catch (err) {
      console.error("Не удалось изменить количество в корзине", err);
    } finally {
      setIsCartUpdating(false);
    }
  };

  const handleRemoveCartLine = async (itemId) => {
    if (!itemId) return;
    setIsCartUpdating(true);
    try {
      const updated = await removeCartItem(itemId);
      updateCartState(updated);
    } catch (err) {
      console.error("Не удалось удалить товар из корзины", err);
    } finally {
      setIsCartUpdating(false);
    }
  };

  const handleCheckout = async () => {
    if (!cart.items.length) return;
    const created = createOrdersFromCart(cart.items, productsById);
    if (!created.length) return;
    setOrders((prev) => [...created, ...prev]);
    setActiveOrderId(created[0].id);
    setRoute("order");
    setIsCartUpdating(true);
    try {
      const cleared = await clearCart();
      updateCartState(cleared);
    } catch (err) {
      console.error("Не удалось очистить корзину после оформления", err);
      updateCartState(null);
    } finally {
      setIsCartUpdating(false);
    }
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
            onLogout={handleLogout}
          />
        ) : (
          <Topbar
            route={route}
            setRoute={setRoute}
            role={role}
            cartCount={cart?.total_items ?? 0}
            isWorkshop={buyerType === "workshop"}
            showSupplierTab={role === "supplier"}
            onLogout={handleLogout}
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
            setSelectedProduct={setSelectedProduct}
            navigateTo={navigateTo}
            onAddToCart={handleAddToCart}
          />
        )}
        {route === "garage" && role === "buyer" && (
          <div className="max-w-xl mx-auto">
            <GarageWidget onVehicleAdded={handleAddVehicle} onVehicleRemoved={removeVehicle} />
          </div>
        )}
        {route === "onboarding:supplier_stripe" && <SupplierStripeOnboarding />}
        {route === "product" && selectedProduct && (
          <ProductDetail
            orgId={user?.organization?.id}
            productId={selectedProduct.id}
            product={selectedProduct}
            onAdd={role !== "supplier" ? (product, quantity) => handleAddToCart(product, quantity) : null}
            onBack={navigateBack}
            onChat={role !== "supplier" ? () => navigateTo("cart") : null}
            isSupplierView={role === "supplier"}
          />
        )}
        {route === "cart" && (
          <CartPage
            cart={cart}
            isLoading={isCartLoading}
            isMutating={isCartUpdating}
            onUpdateQuantity={handleUpdateCartLine}
            onRemoveItem={handleRemoveCartLine}
            onCheckout={handleCheckout}
          />
        )}
        {route === "chat" && role !== "supplier" && <ChatPage role={role} />}
        {route === "supplier:chat" && <SupplierChatPage />}
        {route === "order" && activeOrder && (
          <OrderPage order={activeOrder} onBack={() => navigateBack()} onSend={(t) => sendChatMessage(activeOrder.id, role === "buyer" ? "buyer" : "seller", t)} />
        )}
        {route === "supplier:dashboard" && (
          <SupplierDashboard 
            supplierProfile={supplierProfile} 
            metrics={supplierMetrics} 
            onNavigate={setRoute}
          />
        )}
        {route === "supplier:products" && (
          <SupplierProducts
            orgId={user?.organization?.id}
            products={products}
            setProducts={setProducts}
            supplierProfile={supplierProfile}
            onCreateNavigate={() => navigateTo("supplier:products:new")}
            onProductView={(product) => { 
              setSelectedProduct(product); 
              navigateTo("product"); 
            }}
          />
        )}
        {route === "supplier:products:new" && (
          <SupplierProductCreate
            orgId={user?.organization?.id}
            supplierProfile={supplierProfile}
            onCancel={() => navigateTo("supplier:products")}
            onCreate={(payload) => {
              const id = `p${Date.now()}`;
              const newProd = {
                id,
                title: payload.title,
                price: Number(payload.price) || 0,
                currency: "RUB",
                supplierId: SUPPLIER_SELF_ID,
                supplierName: supplierProfile?.companyName || "My Parts Company",
                condition: "new",
                shipEtaDays: 7,
                category: "Misc",
                vehicle: payload.vehicle || "Any",
                img: payload.img,
              };
              setProducts((prev) => [newProd, ...prev]);
              navigateTo("supplier:products");
            }}
          />
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

/* Modern Authentication Page Animations */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-gradient {
  background-size: 400% 400%;
  animation: gradient-shift 3s ease infinite;
}

/* Landing Page Animations */
@keyframes slideInUp {
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInLeft {
  from { transform: translateX(-100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeInScale {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes rotateIn {
  from { transform: rotate(-10deg) scale(0.8); opacity: 0; }
  to { transform: rotate(0deg) scale(1); opacity: 1; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4); }
}

@keyframes text-glow {
  0%, 100% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
  50% { text-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6); }
}

.animate-slide-up { animation: slideInUp 0.8s ease-out; }
.animate-slide-left { animation: slideInLeft 0.8s ease-out; }
.animate-slide-right { animation: slideInRight 0.8s ease-out; }
.animate-fade-scale { animation: fadeInScale 0.6s ease-out; }
.animate-rotate-in { animation: rotateIn 0.8s ease-out; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-text-glow { animation: text-glow 3s ease-in-out infinite; }

/* Delay classes for staggered animations */
.delay-100 { animation-delay: 0.1s; animation-fill-mode: both; }
.delay-200 { animation-delay: 0.2s; animation-fill-mode: both; }
.delay-300 { animation-delay: 0.3s; animation-fill-mode: both; }
.delay-400 { animation-delay: 0.4s; animation-fill-mode: both; }
.delay-500 { animation-delay: 0.5s; animation-fill-mode: both; }
.animation-delay-6000 { animation-delay: 6s; }

/* Glassmorphism backdrop support */
.backdrop-blur-sm { backdrop-filter: blur(4px); }
.backdrop-blur { backdrop-filter: blur(8px); }
.backdrop-blur-md { backdrop-filter: blur(12px); }
.backdrop-blur-lg { backdrop-filter: blur(16px); }
.backdrop-blur-xl { backdrop-filter: blur(24px); }

/* Custom scrollbar for test accounts */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
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
