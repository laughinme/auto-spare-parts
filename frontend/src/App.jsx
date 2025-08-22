import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "./context/useAuth.js";
import Topbar from "./components/Topbar.jsx";
import SupplierTopbar from "./components/supplier/SupplierTopbar.jsx";
import FYP from "./components/fyp/FYP.jsx";
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
import { MOCK_PRODUCTS } from "./data/mockProducts.js";
import { SUPPLIER_SELF_ID } from "./data/constants.js";
import { createOrdersFromCart } from "./utils/helpers.js";

function App() {
  // Получаем новое состояние isRestoringSession из контекста
  const { user, isUserLoading, logout, isRestoringSession } = useAuth();
  
  const [route, setRoute] = useState("fyp");
  const [previousRoute, setPreviousRoute] = useState("fyp");
  const [role, setRole] = useState(null);
  const [hasInitializedRole, setHasInitializedRole] = useState(false);
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
      console.log('User logged out, resetting role and initialization flag');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log('Processing user data:', user);
      
      let apiRole = user.role || user.type || user.user_type;
      console.log('Found explicit role:', apiRole);
      
      if (!apiRole) {
        console.log('No explicit role found, trying to determine from other data');
        if (user.email && (user.email.includes('supplier') || user.email.includes('vendor') || user.email.includes('shop') || user.email.includes('seller'))) {
          apiRole = 'supplier';
          console.log('Determined role as supplier from email:', user.email);
        } else if (user.is_supplier === true) {
          apiRole = 'supplier';
          console.log('Determined role as supplier from is_supplier field');
        } else {
          apiRole = 'buyer';
          console.log('Defaulting to buyer role');
        }
      }
      
      if (apiRole !== role) {
        console.log('Setting user role:', apiRole, 'for user:', user.email, 'current route:', route);
        setRole(apiRole);
        
        // Перенаправляем пользователя при первой инициализации роли
        if (!hasInitializedRole) {
          console.log('First time role initialization, current route:', route);
          setHasInitializedRole(true);
          if (apiRole === "supplier") {
            console.log('Redirecting supplier to dashboard');
            setRoute("supplier:dashboard");
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

  // НОВЫЙ БЛОК: Показываем экран загрузки, пока идет восстановление сессии
  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Загрузка сессии...</p>
      </div>
    );
  }

  // Эта проверка остается на случай, если сессия восстановлена, но профиль еще грузится
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Загрузка пользователя...</p>
      </div>
    );
  }

  // Если все загрузки завершены и пользователя нет, показываем страницу входа
  if (!user) {
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
    // Clear selected product when navigating back from product detail page
    if (route === "product") {
      setSelectedProduct(null);
    }
    setRoute(previousRoute);
  };

  const navigateToFYP = () => {
    // Always navigate to FYP and clear selected product
    console.log("navigateToFYP called - current route:", route, "clearing selectedProduct");
    setSelectedProduct(null);
    setPreviousRoute(route);
    setRoute("fyp");
  };

  const handleAddToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + quantity } : i));
      }
      return [...prev, { productId: product.id, qty: quantity }];
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
            setSelectedProduct={setSelectedProduct}
            navigateTo={navigateTo}
            onAddToCart={handleAddToCart}
          />
        )}
        {route === "onboarding:supplier_stripe" && <SupplierStripeOnboarding />}
        {route === "product" && selectedProduct && (
          <ProductDetail
            orgId={user?.organization?.id}
            productId={selectedProduct.id}
            product={selectedProduct}
            onAdd={role !== "supplier" ? (product, quantity) => handleAddToCart(product, quantity) : null}
            onBack={navigateToFYP}
            onChat={role !== "supplier" ? () => navigateTo("cart") : null}
            isSupplierView={role === "supplier"}
          />
        )}
        {route === "cart" && (
          <CartPage cart={cart} productsById={productsById} setCart={setCart} onCheckout={handleCheckout} />
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
