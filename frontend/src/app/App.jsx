import React, {
  useCallback,
  useEffect,
  useMemo,
  useState } from
"react";
import { useAuth } from "../entities/user/model/useAuth.js";
import Topbar from "../widgets/topbar/ui/Topbar.jsx";
import SupplierTopbar from "../widgets/topbar/ui/SupplierTopbar.jsx";
import AuthPage from "../pages/auth/ui/AuthPage.jsx";
import LandingPage from "../pages/landing/ui/LandingPage.jsx";
import { useCartManager } from "../features/cart/model/useCartManager.js";
import { calculateSupplierMetrics } from "./model/supplierMetrics.js";
import { determineUserRole } from "./lib/determineUserRole.js";
import { useRouteController } from "./model/useRouteController.js";
import { createOrdersFromCart } from "../entities/order/lib/createOrdersFromCart.js";
import { AppLayout } from "./ui/AppLayout.jsx";
import { RouteRenderer } from "./routes/RouteRenderer.jsx";

export default function App() {
  const { user, isUserLoading, logout, isRestoringSession } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [role, setRole] = useState(null);
  const [hasInitializedRole, setHasInitializedRole] = useState(false);
  const [buyerType] = useState(null);
  const [garage, setGarage] = useState([]);
  const [supplierProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const {
    route,
    previousRoute,
    setRoute,
    navigateTo,
    navigateBack,
    applyRoleGuards
  } = useRouteController("fyp");

  const productsById = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, product])),
    [products]
  );

  const cacheProduct = useCallback((product) => {
    if (!product?.id) return;
    setProducts((prev) => {
      const index = prev.findIndex((item) => item.id === product.id);
      if (index === -1) {
        return [...prev, product];
      }
      const next = [...prev];
      next[index] = { ...next[index], ...product };
      return next;
    });
  }, []);

  const {
    cart,
    isCartLoading,
    isCartUpdating,
    addToCart,
    updateQuantity,
    removeItem,
    checkoutCart,
    resetCart
  } = useCartManager({ user, onProductCached: cacheProduct });

  const activeOrder = useMemo(
    () => orders.find((order) => order.id === activeOrderId) || null,
    [activeOrderId, orders]
  );

  const supplierMetrics = useMemo(
    () => calculateSupplierMetrics(orders, products),
    [orders, products]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("userRole");
    setShowLanding(true);
    setOrders([]);
    setActiveOrderId(null);
    setProducts([]);
    setSelectedProduct(null);
    resetCart();
    logout();
  }, [logout, resetCart]);

  const handleAddVehicle = useCallback((value) => {
    const vehicle = String(value || "").trim();
    if (!vehicle) return;
    setGarage((prev) => Array.from(new Set([vehicle, ...prev])).slice(0, 6));
  }, []);

  const removeVehicle = useCallback((value) => {
    setGarage((prev) => prev.filter((item) => item !== value));
  }, []);

  const handleCheckout = useCallback(async () => {
    try {
      const created = await checkoutCart((items) =>
      createOrdersFromCart(items, productsById)
      );
      if (!created.length) return;
      setOrders((prev) => [...created, ...prev]);
      setActiveOrderId(created[0].id);
      navigateTo("order");
    } catch (error) {
      console.error("Не удалось оформить заказ", error);
    }
  }, [checkoutCart, navigateTo, productsById]);

  const sendChatMessage = useCallback((orderId, author, text) => {
    setOrders((prev) =>
    prev.map((order) =>
    order.id === orderId ?
    {
      ...order,
      chat: [
      ...order.chat,
      {
        id: `m-${Date.now()}`,
        author,
        text,
        ts: new Date().toISOString()
      }]

    } :
    order
    )
    );

    if (author === "buyer") {
      setTimeout(() => {
        setOrders((prev) =>
        prev.map((order) =>
        order.id === orderId ?
        {
          ...order,
          chat: [
          ...order.chat,
          {
            id: `m-${Date.now()}-r`,
            author: "seller",
            text: "Здравствуйте! Подтверждаю наличие. Уточните VIN или фото детали, пожалуйста.",
            ts: new Date().toISOString()
          }]

        } :
        order
        )
        );
      }, 650);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setHasInitializedRole(false);
      localStorage.removeItem("userRole");
      resetCart();
      setOrders([]);
      setActiveOrderId(null);
      setSelectedProduct(null);
      setShowLanding(true);
      return;
    }

    setShowLanding(false);
    const nextRole = determineUserRole(user, role);
    if (nextRole !== role) {
      setRole(nextRole);
    }
  }, [resetCart, role, user]);

  useEffect(() => {
    if (!user || !role || hasInitializedRole) {
      return;
    }
    setHasInitializedRole(true);
    if (role === "supplier") {
      if (localStorage.getItem("userRole") === "supplier") {
        setRoute("onboarding:supplier_stripe");
      } else {
        setRoute("supplier:dashboard");
      }
    } else {
      navigateTo("fyp");
    }
  }, [hasInitializedRole, navigateTo, role, setRoute, user]);

  useEffect(() => {
    if (role) {
      applyRoleGuards(role);
    }
  }, [applyRoleGuards, role, route]);

  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Загрузка сессии...</p>
      </div>);

  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Загрузка пользователя...</p>
      </div>);

  }

  if (!user) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <AuthPage />;
  }

  const showTopbar = route !== "onboarding:supplier_stripe";
  const isSupplierRoute = route.startsWith("supplier:");

  const topbarNode = showTopbar ?
  isSupplierRoute || role === "supplier" ?

  <SupplierTopbar
    route={route}
    setRoute={setRoute}
    onLogout={handleLogout} /> :



  <Topbar
    route={route}
    setRoute={setRoute}
    role={role}
    cartCount={cart?.total_items ?? 0}
    isWorkshop={buyerType === "workshop"}
    showSupplierTab={role === "supplier"}
    onLogout={handleLogout} /> :


  null;

  return (
    <AppLayout topbar={topbarNode}>
      <RouteRenderer
        route={route}
        role={role}
        buyerType={buyerType}
        garage={garage}
        onAddVehicle={handleAddVehicle}
        onRemoveVehicle={removeVehicle}
        navigateTo={navigateTo}
        addToCart={addToCart}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        userOrgId={user?.organization?.id}
        cart={cart}
        isCartLoading={isCartLoading}
        isCartUpdating={isCartUpdating}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        handleCheckout={handleCheckout}
        activeOrder={activeOrder}
        navigateBack={navigateBack}
        sendChatMessage={sendChatMessage}
        supplierProfile={supplierProfile}
        supplierMetrics={supplierMetrics}
        setRoute={setRoute}
        products={products}
        setProducts={setProducts} />

    </AppLayout>);

}